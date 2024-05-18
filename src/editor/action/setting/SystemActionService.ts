import { window } from "vscode";

import { SystemActionType, SystemActionHandler } from "./SystemActionType";
import { Service } from "../../../service/Service";
import { AutoDevExtension } from "../../../AutoDevExtension";
import { channel } from "../../../channel";
import { SimilarChunkSearcher } from "../../../code-search/similar/SimilarChunkSearcher";
import { SimilarSearchElementBuilder } from "../../../code-search/similar/SimilarSearchElementBuilder";
import { Catalyser } from "../../../agent/catalyser/Catalyser";
import { SimilarChunk } from "../../../code-search/similar/SimilarChunk";

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
			[SystemActionType.Indexing]: this.indexingAction.bind(this),
			[SystemActionType.SemanticSearchKeyword]: this.intentionSemanticSearch.bind(this),
			[SystemActionType.SemanticSearchCode]: this.intentionSemanticSearch.bind(this),
			[SystemActionType.SimilarCodeSearch]: this.searchSimilarCode.bind(this),
		};

		pick.items = Object.keys(items).map(label => ({ label }));
		pick.onDidChangeSelection(async selection => {
			if (selection[0]) {
				const item = items[selection[0].label];
				await item(extension, selection[0].label as SystemActionType);
				pick.hide();
			}
		});

		pick.onDidHide(() => pick.dispose());
		pick.show();
	}

	async intentionSemanticSearch(extension: AutoDevExtension, type: SystemActionType) {
		let inputBox = window.createInputBox();
		inputBox.title = "Natural Language query for code search";
		inputBox.onDidAccept(async () => {
			const query = inputBox.value;
			inputBox.hide();
			await Catalyser.getInstance(extension).query(query, type);
		});

		inputBox.onDidHide(() => inputBox.dispose());
		inputBox.show();
	}

	async searchSimilarCode(extension: AutoDevExtension) {
		let searchElement = SimilarSearchElementBuilder.from(window.activeTextEditor).build();
		let queryResult: SimilarChunk[] = SimilarChunkSearcher.instance().query(searchElement);
		channel.append("Similar code search result: \n");
		queryResult.forEach(chunk => {
			channel.append("File: " + chunk.path + "\n");
			channel.append("Text: " + chunk.text + "\n");
		});
	}

	async indexingAction(extension: AutoDevExtension) {
		return await extension.indexing();
	}
}