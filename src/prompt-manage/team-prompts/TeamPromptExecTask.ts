import { ChatMessage, ChatRole } from "../../llm-provider/ChatMessage";
import { TeamPromptAction } from "./TeamPromptAction";
import vscode from "vscode";
import { InteractionType } from "../InteractionType";

class TeamPromptExecTask implements vscode.Disposable {
	project: vscode.WorkspaceFolder;
	msgs: ChatMessage[];
	editor: vscode.TextEditor;
	intentionConfig: TeamPromptAction;
	element: vscode.Position | null;

	constructor(
		project: vscode.WorkspaceFolder,
		msgs: ChatMessage[],
		editor: vscode.TextEditor,
		intentionConfig: TeamPromptAction,
		element: vscode.Position | null
	) {
		this.project = project;
		this.msgs = msgs;
		this.editor = editor;
		this.intentionConfig = intentionConfig;
		this.element = element;
	}

	async run() {
		const offset = this.editor.selection.active.character;

		const userPrompt = this.msgs
			.filter(msg => msg.role === ChatRole.User)
			.map(msg => msg.content)
			.join('\n');

		const systemPrompt = this.msgs
			.filter(msg => msg.role === ChatRole.System)
			.map(msg => msg.content)
			.join('\n');

		switch (this.intentionConfig.actionPrompt.interaction) {
			case InteractionType.ChatPanel:
				// Implement your logic for ChatPanel interaction
				break;

			case InteractionType.AppendCursor:
			case InteractionType.AppendCursorStream:
				const msgString = `${systemPrompt}\n${userPrompt}`;
				// Implement your logic for AppendCursor and AppendCursorStream interactions
				break;

			case InteractionType.OutputFile:
				const fileName = this.intentionConfig.actionPrompt.other['fileName'] as string | undefined;
				// Implement your logic for OutputFile interaction
				break;

			case InteractionType.ReplaceSelection:
				const replaceMsgString = `${systemPrompt}\n${userPrompt}`;
				// Implement your logic for ReplaceSelection interaction
				break;
		}
	}

	dispose() {
		// Dispose any resources here if needed
	}
}
