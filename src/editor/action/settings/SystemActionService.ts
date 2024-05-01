import { window } from "vscode";

import { Service } from "../../../service/Service";
import { AutoDevExtension } from "../../../AutoDevExtension";
import { channel } from "../../../channel";
import { SearchElementBuilder } from "../../../code-search/similar/SearchElement";
import { SimilarChunk } from "../../../code-search/similar/SimilarChunk";
import { SystemAction, SystemActionHandler } from "./SystemAction";

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

	private async indexingAction(extension: AutoDevExtension) {
		channel.append("TODO: Indexing...");
	}

	async intentionSemanticSearch(extension: AutoDevExtension) {
		let inputBox = window.createInputBox();

		inputBox.title = "Search for similar code";

		inputBox.onDidAccept(async () => {
			const query = inputBox.value;

			// execute for similar search

			extension.sidebar.webviewProtocol?.request("search", { query });
			inputBox.hide();
		});

		inputBox.onDidHide(() => inputBox.dispose());
		inputBox.show();
	}

	async searchSimilarCode(extension: AutoDevExtension) {
		let searchElement = SearchElementBuilder.from(window.activeTextEditor).build();
		let queryResult = SimilarChunk.instance().query(searchElement);
		channel.append("Similar code search result: \n" + queryResult.join("\n") + "\n");
	}
}