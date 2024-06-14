import { Catalyser } from 'src/agent/catalyser/Catalyser';
import { ThemeIcon, window } from 'vscode';

import { ChatMessageRole } from 'base/common/language-models/languageModels';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { logger } from 'base/common/log/log';
import { showErrorMessage } from 'base/common/messages/messages';

import { AutoDevExtension } from '../../AutoDevExtension';
import { SimilarChunk } from '../../code-search/similar/SimilarChunk';
import { SimilarChunkSearcher } from '../../code-search/similar/SimilarChunkSearcher';
import { SimilarSearchElementBuilder } from '../../code-search/similar/SimilarSearchElementBuilder';
import { openSettings } from '../../commands/commands';
import { Service } from '../../service/Service';
import { SystemActionType } from './SystemActionType';

/**
 * A better example will be: [QuickInput Sample](https://github.com/microsoft/vscode-extension-samples/tree/main/quickinput-sample)
 */
export class SystemActionService implements Service {
	private catalyser: Catalyser;
	private lm: LanguageModelsService;

	constructor(private extension: AutoDevExtension) {
		this.catalyser = extension.catalyser;
		this.lm = extension.lm;
	}

	async show() {
		let pick = window.createQuickPick<{
			label: string;
			action: () => void;
		}>();

		pick.items = [
			{
				label: SystemActionType.Indexing,
				action: () => this.intentionSemanticSearch(SystemActionType.Indexing),
			},
			{
				label: SystemActionType.SemanticSearchKeyword,
				action: () => this.intentionSemanticSearch(SystemActionType.SemanticSearchKeyword),
			},
			{
				label: SystemActionType.SemanticSearchCode,
				action: () => this.intentionSemanticSearch(SystemActionType.SemanticSearchCode),
			},
			{
				label: SystemActionType.SimilarCodeSearch,
				action: () => this.searchSimilarCode(),
			},
			{
				label: SystemActionType.OpenSettings,
				action: openSettings,
			},
		];

		pick.onDidChangeSelection(async selection => {
			pick.hide();

			const [item] = selection;

			if (item) {
				item.action();
			}
		});

		pick.onDidHide(() => pick.dispose());
		pick.show();
	}

	intentionSemanticSearch(type: SystemActionType) {
		const inputBox = window.createInputBox();

		inputBox.title = 'Natural Language query for code search';
		inputBox.placeholder = 'Enter your query';
		inputBox.ignoreFocusOut = true;

		inputBox.onDidAccept(async () => {
			const query = inputBox.value;

			try {
				inputBox.busy = true;
				inputBox.prompt = 'Thinking...\n\n';

				logger.show(false);

				const prompt = await this.catalyser.query(query, type);

				inputBox.prompt = 'Asking...\n\n';

				if (prompt) {
					logger.debug('Ask: ' + prompt);
				} else {
					logger.debug('Ask: ' + query);
				}

				inputBox.prompt = '';

				await this.lm.chat(
					[
						{
							role: ChatMessageRole.User,
							content: prompt || query,
						},
					],
					{},
					{
						report(framgent) {
							inputBox.prompt += framgent.part;
						},
					},
				);
			} catch (err) {
				inputBox.prompt = 'Code Search failed\n\n';
				logger.error('Search failed: ', err);
				showErrorMessage('Code Search failed');
			} finally {
				inputBox.busy = false;
			}
		});

		inputBox.onDidHide(() => inputBox.dispose());
		inputBox.show();
	}

	async searchSimilarCode() {
		logger.show(false);

		const editor = window.activeTextEditor;
		if (!editor) {
			logger.error('No active editor');
			return;
		}

		let searchElement = SimilarSearchElementBuilder.from(editor).build();
		let queryResult: SimilarChunk[] = SimilarChunkSearcher.instance().search(searchElement);

		logger.append('Similar code search result: \n');

		queryResult.forEach(chunk => {
			logger.append('File: ' + chunk.path + '\n');
			logger.append('Text: ' + chunk.text + '\n');
		});
	}

	async indexingAction() {
		return await this.extension.createCodebaseIndex();
	}
}
