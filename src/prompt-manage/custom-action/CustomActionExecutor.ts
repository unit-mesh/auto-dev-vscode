import { CustomActionTemplateContext } from "./CustomActionTemplateContext";
import { LlmProvider } from "../../llm-provider/LlmProvider";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor/editor-api/AutoDevStatusManager";
import { CustomActionPrompt } from "./CustomActionPrompt";
import { InteractionType } from "../../custom-action/InteractionType";
import vscode, { TextEditor } from "vscode";
import { FileGenerateTask } from "../executor/FileGenerateTask";

export class CustomActionExecutor {
	public static async execute(context: CustomActionTemplateContext, prompt: CustomActionPrompt) {
		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.InProgress);
		console.info(`request: ${JSON.stringify(prompt.messages)}`);

		let llm = LlmProvider.instance();
		let output: string = "";

		try {
			for await (const chunk of llm._streamChat(prompt.messages)) {
				output += chunk.content;
			}
		} catch (e) {
			console.error(e);
			AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.Error);
			return Promise.reject(e);
		}
		console.info(`result: ${output}`);

		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.Done);

		await CustomActionExecutor.handleOutput(prompt, output);
	}

	private static async handleOutput(prompt: CustomActionPrompt, outputText: string) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		switch (prompt.interaction) {
			case InteractionType.ChatPanel:
				// todo:
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