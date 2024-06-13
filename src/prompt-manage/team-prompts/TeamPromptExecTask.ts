import { ChatMessageRole, IChatMessage } from 'base/common/language-models/languageModels';
import vscode from 'vscode';

import { InteractionType } from '../InteractionType';
import { TeamPromptAction } from './TeamPromptAction';

class TeamPromptExecTask implements vscode.Disposable {
	project: vscode.WorkspaceFolder;
	msgs: IChatMessage[];
	editor: vscode.TextEditor;
	intentionConfig: TeamPromptAction;
	element: vscode.Position | null;

	constructor(
		project: vscode.WorkspaceFolder,
		msgs: IChatMessage[],
		editor: vscode.TextEditor,
		intentionConfig: TeamPromptAction,
		element: vscode.Position | null,
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
			.filter(msg => msg.role === ChatMessageRole.User)
			.map(msg => msg.content)
			.join('\n');

		const systemPrompt = this.msgs
			.filter(msg => msg.role === ChatMessageRole.System)
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
