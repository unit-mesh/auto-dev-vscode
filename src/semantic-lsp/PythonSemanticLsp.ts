import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	State,
	StateChangeEvent,
	TransportKind
} from "vscode-languageclient/node";
import { SemanticLsp } from "./SemanticLsp";
import vscode, { extensions, workspace } from "vscode";
import { AutoDevExtension } from "../AutoDevExtension";

export class PythonSemanticLsp implements SemanticLsp {
	private autoDevExtension: AutoDevExtension;
	private context: vscode.ExtensionContext;
	private client: LanguageClient | undefined;

	constructor(autoDevExtension: AutoDevExtension) {
		this.autoDevExtension = autoDevExtension;
		this.context = autoDevExtension.extensionContext;
	}

	async isActive(): Promise<boolean> {
		return true;
	}

	async getLanguageClient(): Promise<LanguageClient | undefined> {
		let pylance = extensions.getExtension("ms-python.vscode-pylance");
		await pylance?.activate();
		if (!pylance) {
			return;
		}
		let { path: lsPath } = await pylance.exports.languageServerFolder();

		// The server is implemented in node
		let serverModule = this.context.asAbsolutePath(lsPath);
		// The debug options for the server
		// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
		let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

		// If the extension is launched in debug mode then the debug server options are used
		// Otherwise the run options are used
		let serverOptions: ServerOptions = {
			run: { module: serverModule, transport: TransportKind.ipc },
			debug: {
				module: serverModule,
				transport: TransportKind.ipc,
				options: debugOptions,
			},
		};

		// Options to control the language client
		let clientOptions: LanguageClientOptions = {
			// Register the server for plain text documents
			documentSelector: [{ scheme: "file", language: "python" }],
			synchronize: {
				// Notify the server about file changes to '.clientrc files contained in the workspace
				fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
			},
		};

		// Create the language client and start the client.
		this.client = new LanguageClient(
			"languageServerExample",
			"Language Server Example",
			serverOptions,
			clientOptions,
		);
		return this.client;
	}

	async makeRequest(method: string, param: any): Promise<any> {
		if (!this.client) {return;}

		if (this.client.state === State.Starting) {
			return new Promise((resolve, reject) => {
				let stateListener = this.client!!.onDidChangeState((e: StateChangeEvent) => {
					if (e.newState === State.Running) {
						stateListener.dispose();
						resolve(this.client!!.sendRequest(method, param));
					} else if (e.newState === State.Stopped) {
						stateListener.dispose();
						reject(new Error("Language server stopped unexpectedly"));
					}
				});
			});
		} else {
			return this.client.sendRequest(method, param);
		}
	}
}
