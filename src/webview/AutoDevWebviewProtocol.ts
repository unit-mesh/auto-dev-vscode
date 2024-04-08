import * as vscode from "vscode";


export class AutoDevWebviewProtocol {
	// pub /sub pattern
	private _messageQueue: Array<any> = [];
	private _onMessage = new vscode.EventEmitter<any>();

	get onMessage() {
		return this._onMessage.event;
	}

	constructor(private readonly _webview: vscode.Webview) {
		this._webview.onDidReceiveMessage((message) => {
			this._onMessage.fire(message);
		});
	}

	public request(command: string, data: any) {
		this._webview.postMessage({ command, data });
	}

	public respond(command: string, data: any) {
		this._webview.postMessage({ command, data });
	}

}
