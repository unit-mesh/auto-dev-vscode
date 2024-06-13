import { newChatSession } from 'src/commands/commands';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import vscode, { CancellationTokenSource, TextEditor } from 'vscode';

import { AutoDevExtension } from '../../AutoDevExtension';
import { AutoDevStatus, AutoDevStatusManager } from '../../editor/editor-api/AutoDevStatusManager';
import { FileGenerateTask } from '../executor/FileGenerateTask';
import { InteractionType } from '../InteractionType';
import { TemplateRender } from '../template/TemplateRender';
import { CustomActionPrompt } from './CustomActionPrompt';
import { CustomActionTemplateContext } from './CustomActionTemplateContext';

export class CustomActionExecutor {
	constructor(
		private lm: LanguageModelsService,
		private compiler: TemplateRender,
		private statusBarManager: AutoDevStatusManager,
	) {}

	async execute(context: CustomActionTemplateContext, prompt: CustomActionPrompt, extension: AutoDevExtension) {
		this.statusBarManager.setStatus(AutoDevStatus.InProgress);
		const compiler = this.compiler;
		const messages = prompt.messages.map(msg => {
			return {
				role: msg.role,
				content: compiler.render(msg.content, context),
			};
		});

		console.info(`request: ${JSON.stringify(messages)}`);

		let output: string = '';

		const cancellation = new CancellationTokenSource();

		try {
			await this.lm.chat(
				messages,
				{},
				{
					report(fragment) {
						output += fragment.part;
					},
				},
				cancellation.token,
			);
		} catch (e) {
			console.error(e);
			this.statusBarManager.setStatus(AutoDevStatus.Error);
			return Promise.reject(e);
		}
		console.info(`result: ${output}`);

		this.statusBarManager.setStatus(AutoDevStatus.Done);

		await CustomActionExecutor.handleOutput(prompt, output, extension);
	}

	private static async handleOutput(prompt: CustomActionPrompt, outputText: string, extension: AutoDevExtension) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		switch (prompt.interaction) {
			case InteractionType.ChatPanel:
				await newChatSession(outputText);
				break;
			case InteractionType.AppendCursor:
				CustomActionExecutor.insertText(editor, outputText);
				break;
			case InteractionType.AppendCursorStream:
				CustomActionExecutor.insertText(editor, outputText);
				break;
			case InteractionType.OutputFile:
				let generateTask = new FileGenerateTask(vscode.workspace.getWorkspaceFolder(editor.document.uri)!!, outputText);

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
		vscode.window.activeTextEditor?.edit(editBuilder => {
			editBuilder.insert(editor.selection.active, inputText);
		});
	}

	private static updateText(editor: TextEditor, inputText: string) {
		vscode.window.activeTextEditor?.edit(editBuilder => {
			editBuilder.replace(editor.selection, inputText);
		});
	}
}
