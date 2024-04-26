import { CustomActionTemplateContext } from "./CustomActionTemplateContext";
import { LlmProvider } from "../../llm-provider/LlmProvider";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor/editor-api/AutoDevStatusManager";
import { CustomActionPrompt } from "./CustomActionPrompt";
import { InteractionType } from "../InteractionType";
import vscode, { TextEditor } from "vscode";
import { FileGenerateTask } from "../executor/FileGenerateTask";
import { TemplateRender } from "../template/TemplateRender";
import { AutoDevExtension } from "../../AutoDevExtension";

export class CustomActionExecutor {
	public static async execute(context: CustomActionTemplateContext, prompt: CustomActionPrompt, extension: AutoDevExtension) {
		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.InProgress);
		const compiler = new TemplateRender();
		const messages = prompt.messages.map((msg) => {
			return {
				role: msg.role,
				content: compiler.render(msg.content, context),
			};
		});

		console.info(`request: ${JSON.stringify(messages)}`);

		let llm = LlmProvider.instance();
		let output: string = "";

		try {
			for await (const chunk of llm._streamChat(messages)) {
				output += chunk.content;
			}
		} catch (e) {
			console.error(e);
			AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.Error);
			return Promise.reject(e);
		}
		console.info(`result: ${output}`);

		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.Done);

		await CustomActionExecutor.handleOutput(prompt, output, extension);
	}

	private static async handleOutput(prompt: CustomActionPrompt, outputText: string, extension: AutoDevExtension) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		switch (prompt.interaction) {
			case InteractionType.ChatPanel:
				await extension.sidebar.webviewProtocol.request("userInput", { input: outputText });
				break;
			case InteractionType.AppendCursor:
				CustomActionExecutor.insertText(editor, outputText);
				break;
			case InteractionType.AppendCursorStream:
				CustomActionExecutor.insertText(editor, outputText);
				break;
			case InteractionType.OutputFile:
				let generateTask = new FileGenerateTask(
					vscode.workspace.getWorkspaceFolder(editor.document.uri)!!,
					outputText,
				);

				await generateTask.run();
				break;
			case InteractionType.ReplaceSelection:
				CustomActionExecutor.updateText(editor, outputText);
				break;
			default:
				throw new Error(`Unknown interaction type: ${prompt.interaction}`);
		}
	}

	private static insertText(editor: TextEditor, inputText: string) {
		vscode.window.activeTextEditor?.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, inputText);
		});
	}

	private static updateText(editor: TextEditor, inputText: string) {
		vscode.window.activeTextEditor?.edit((editBuilder) => {
			editBuilder.replace(editor.selection, inputText);
		});
	}
}