import { AutoDevExtension } from "../../AutoDevExtension";
import { channel } from "../../channel";
import { HydeKeywordsStrategy } from "../../code-search/search-strategy/HydeKeywordsStrategy";
import { SystemActionType } from "../../editor/action/setting/SystemActionType";
import { HydeCodeStrategy } from "../../code-search/search-strategy/HydeCodeStrategy";
import { StrategyOutput } from "../../code-search/search-strategy/_base/StrategyOutput";

export class Catalyser {
	private static instance: Catalyser;
	private extension: AutoDevExtension;

	private constructor(extension: AutoDevExtension) {
		this.extension = extension;
	}

	/**
	 * Get the instance of the Catalyser.
	 */
	static getInstance(extension: AutoDevExtension): Catalyser {
		if (!Catalyser.instance) {
			Catalyser.instance = new Catalyser(extension);
		}
		return Catalyser.instance;
	}

	async query(query: string, type: SystemActionType): Promise<void> {
		channel.append("Semantic search for code: " + query + "\n");

		let evaluateOutput : StrategyOutput | undefined = undefined;
		switch (type) {
			case SystemActionType.SemanticSearchKeyword:
				let keywordsStrategy = new HydeKeywordsStrategy(query, this.extension);
				evaluateOutput = await keywordsStrategy.execute();
				break;
			case SystemActionType.SemanticSearchCode:
				let strategy = new HydeCodeStrategy(query, this.extension);
				evaluateOutput = await strategy.execute();
				break;
			default:
				channel.append("Unknown action type: " + type + "\n");
				break;
		}

		if (!evaluateOutput) {
			channel.append("No output from the strategy\n");
			return;
		}

		this.extension.sidebar?.webviewProtocol?.request("userInput", {
			input: evaluateOutput,
		});
	}
}
