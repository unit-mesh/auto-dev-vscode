import { window } from "vscode";

import { SystemAction, SystemActionHandler } from "./SystemAction";
import { Service } from "../../../service/Service";
import { AutoDevExtension } from "../../../AutoDevExtension";
import { channel } from "../../../channel";
import { SimilarChunkSearcher } from "../../../code-search/similar/SimilarChunkSearcher";
import { SimilarSearchElementBuilder } from "../../../code-search/similar/SimilarSearchElementBuilder";
import { ContextItem, retrieveContextItemsFromEmbeddings } from "../../../code-search/retrieval/retrieval";

/**
 * A better example will be: [QuickInput Sample](https://github.com/microsoft/vscode-extension-samples/tree/main/quickinput-sample)
 */
export class SystemActionService implements Service {
	private static instance_: SystemActionService;

	private constructor() {
	}

	public static instance(): SystemActionService {
		if (!SystemActionService.instance_) {
			SystemActionService.instance_ = new SystemActionService();
		}

		return SystemActionService.instance_;
	}

	async show(extension: AutoDevExtension) {
		let pick = window.createQuickPick();

		const items: { [key: string]: SystemActionHandler } = {
			[SystemAction.Indexing]: this.indexingAction.bind(this),
			[SystemAction.IntentionSemanticSearch]: this.intentionSemanticSearch.bind(this),
			[SystemAction.SimilarCodeSearch]: this.searchSimilarCode.bind(this),
		};

		pick.items = Object.keys(items).map(label => ({ label }));
		pick.onDidChangeSelection(async selection => {
			if (selection[0]) {
				const item = items[selection[0].label];
				await item(extension);
				pick.hide();
			}
		});

		pick.onDidHide(() => pick.dispose());
		pick.show();
	}

	async intentionSemanticSearch(extension: AutoDevExtension) {
		let inputBox = window.createInputBox();

		inputBox.title = "Search for similar code";

		inputBox.onDidAccept(async () => {
			const query = inputBox.value;
			channel.append("Semantic search for code: " + query + "\n");

			let result = await retrieveContextItemsFromEmbeddings(query, extension.ideAction, extension.embeddingsProvider!!, undefined);
			result.forEach((item: ContextItem) => {
				channel.appendLine(JSON.stringify(item));
			});
			inputBox.hide();
		});

		inputBox.onDidHide(() => inputBox.dispose());
		inputBox.show();
	}

	async searchSimilarCode(extension: AutoDevExtension) {
		let searchElement = SimilarSearchElementBuilder.from(window.activeTextEditor).build();
		let queryResult = SimilarChunkSearcher.instance().query(searchElement);
		channel.append("Similar code search result: \n" + queryResult.join("\n") + "\n");
	}

	async indexingAction(extension: AutoDevExtension) {
		return await extension.indexing();
	}
}