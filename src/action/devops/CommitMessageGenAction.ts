import { AutoDevExtension } from 'src/AutoDevExtension';
import { ProgressLocation, window } from 'vscode';

import { logger } from 'base/common/log/log';
import { showErrorMessage } from 'base/common/messages/messages';

import { GitAction } from '../../git/GitAction';
import { ActionType } from '../../prompt-manage/ActionType';
import { CustomActionPrompt } from '../../prompt-manage/custom-action/CustomActionPrompt';
import { TemplateContext } from '../../prompt-manage/template/TemplateContext';
import type { InputBox } from '../../types/git';

export class CommitMessageGenAction {
	// extension: Extension<Git>;

	constructor(private autodev: AutoDevExtension) {}

	async handleDiff(inputBox: InputBox) {
		let diff = await new GitAction().getDiff();

		console.info('diff: ', JSON.stringify(diff));

		let context: CommitMessageTemplateContext = {
			language: '',
			historyExamples: [],
			diffContent: diff,
		};

		let instruction = await this.autodev.promptManager.generateInstruction(ActionType.GenCommitMessage, context);
		const messages = CustomActionPrompt.parseChatMessage(instruction);

		inputBox.value = '';

		await window.withProgress(
			{
				location: ProgressLocation.Notification,
				title: 'Generating Commit Message',
				cancellable: true,
			},
			async (progress, token) => {
				try {
					await this.autodev.lm.chat(
						messages,
						{},
						{
							report(choice) {
								inputBox.value += choice.part;
							},
						},
						token,
					);
				} catch (error) {
					logger.error((error as Error).message);
					showErrorMessage('Generate Commit Message Error');
				}
			},
		);
	}
}

export interface CommitMessageTemplateContext extends TemplateContext {
	historyExamples: string[];
	diffContent: string;
}
