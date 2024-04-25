import { CustomActionTemplateContext } from "./CustomActionTemplateContext";
import { LlmProvider } from "../../llm-provider/LlmProvider";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor/editor-api/AutoDevStatusManager";
import { MarkdownCodeBlock } from "../../markdown/MarkdownCodeBlock";
import { CustomActionPrompt } from "./CustomActionPrompt";
import { InteractionType } from "../../custom-action/InteractionType";
import vscode from "vscode";

export class CustomActionExecutor {
	public static async execute(context: CustomActionTemplateContext, prompt: CustomActionPrompt) {
		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.InProgress);
		const content = "";
		console.info(`request: ${content}`);

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

		CustomActionExecutor.handleOutput(prompt, output);
	}

	private static handleOutput(prompt: CustomActionPrompt, inputText: string) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		switch (prompt.interaction) {
			case InteractionType.ChatPanel:
				// todo:
				break;
			case InteractionType.AppendCursor:
				break;
			case InteractionType.AppendCursorStream:
				break;
			case InteractionType.OutputFile:
				break;
			case InteractionType.ReplaceSelection:
				break;
			default:
				throw new Error(`Unknown interaction type: ${prompt.interaction}`);
		}
	}
}