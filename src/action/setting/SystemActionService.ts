import { window } from 'vscode';

import { logger } from 'base/common/log/log';

import { AutoDevExtension } from '../../AutoDevExtension';
import { SimilarChunk } from '../../code-search/similar/SimilarChunk';
import { SimilarChunkSearcher } from '../../code-search/similar/SimilarChunkSearcher';
import { SimilarSearchElementBuilder } from '../../code-search/similar/SimilarSearchElementBuilder';
import { openSettings } from '../../commands/commands';
import { Service } from '../../service/Service';
import { SystemActionHandler, SystemActionType } from './SystemActionType';

/**
 * A better example will be: [QuickInput Sample](https://github.com/microsoft/vscode-extension-samples/tree/main/quickinput-sample)
 */
export class SystemActionService implements Service {
	constructor(private extension: AutoDevExtension) {}
	async show() {
		let pick = window.createQuickPick();

		const items: { [key: string]: SystemActionHandler } = {
			[SystemActionType.Indexing]: this.indexingAction.bind(this),
			[SystemActionType.SemanticSearchKeyword]: this.intentionSemanticSearch.bind(this),
			[SystemActionType.SemanticSearchCode]: this.intentionSemanticSearch.bind(this),
			[SystemActionType.SimilarCodeSearch]: this.searchSimilarCode.bind(this),
			[SystemActionType.OpenSettings]: openSettings,
		};

		pick.items = Object.keys(items).map(label => ({ label }));
		pick.onDidChangeSelection(async selection => {
			if (selection[0]) {
				const item = items[selection[0].label];
				await item(selection[0].label as SystemActionType);
				pick.hide();
			}
		});

		pick.onDidHide(() => pick.dispose());
		pick.show();
	}

	async intentionSemanticSearch(type: SystemActionType) {
		let inputBox = window.createInputBox();
		inputBox.title = 'Natural Language query for code search';
		inputBox.onDidAccept(async () => {
			const query = inputBox.value;
			inputBox.hide();
			await this.extension.catalyser.query(query, type);
		});

		inputBox.onDidHide(() => inputBox.dispose());
		inputBox.show();
	}

	async searchSimilarCode() {
		let searchElement = SimilarSearchElementBuilder.from(window.activeTextEditor).build();
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
