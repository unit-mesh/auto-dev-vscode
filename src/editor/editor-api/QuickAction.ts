import { window } from 'vscode';

import { logger } from 'base/common/log/log';
import { showErrorMessage } from 'base/common/messages/messages';

import { AutoDevExtension } from '../../AutoDevExtension';
import { CustomActionContextBuilder } from '../../prompt-manage/custom-action/CustomActionContextBuilder';
import { CustomActionExecutor } from '../../prompt-manage/custom-action/CustomActionExecutor';
import { CustomActionPrompt } from '../../prompt-manage/custom-action/CustomActionPrompt';
import { TeamPromptsBuilder } from '../../prompt-manage/team-prompts/TeamPromptsBuilder';
import { Service } from '../../service/Service';

export class QuickActionService implements Service {
	private items: { [key: string]: CustomActionPrompt } = {};

	constructor(
		private teamPromptsBuilder: TeamPromptsBuilder,
		private customActionExecutor: CustomActionExecutor,
		private extension: AutoDevExtension,
	) {}

	registerCustomPrompt(name: string, prompt: CustomActionPrompt) {
		this.items[name] = prompt;
	}

	async show() {
		this.items = {};
		let quickPick = window.createQuickPick();
		let customPrompts = this.teamPromptsBuilder.teamPrompts();

		if (customPrompts.length === 0) {
			logger.append('No custom prompts found');
			return;
		}

		customPrompts.forEach(prompt => {
			this.registerCustomPrompt(prompt.actionName, prompt.actionPrompt);
		});

		quickPick.items = Object.keys(this.items).map(label => ({ label }));
		quickPick.onDidChangeSelection(async selection => {
			if (selection[0]) {
				logger.append('Selected: ' + selection[0].label);
				quickPick.busy = true;
				quickPick.enabled = false;
				const item = this.items[selection[0].label];
				await this.execute(this.extension, item);
				quickPick.busy = false;
				quickPick.hide();
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}

	async execute(extension: AutoDevExtension, prompt: CustomActionPrompt) {
		try {
			const currentDocument = window.activeTextEditor?.document;
			if (!currentDocument) {
				return;
			}

			const context = await CustomActionContextBuilder.fromDocument(extension, currentDocument);
			await this.customActionExecutor.execute(context, prompt, extension);
		} catch (error) {
			logger.error('Execute custom action error: ', error);
			showErrorMessage('Execute custom action error');
		}
	}
}
