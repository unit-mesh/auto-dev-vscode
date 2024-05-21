import { AutoDevExtension } from "../../AutoDevExtension";
import { channel } from "../../channel";
import { HydeKeywordsStrategy } from "../../code-search/search-strategy/HydeKeywordsStrategy";
import { SystemActionType } from "../../action/setting/SystemActionType";
import { HydeCodeStrategy } from "../../code-search/search-strategy/HydeCodeStrategy";
import { StrategyOutput } from "../../code-search/search-strategy/_base/StrategyOutput";
import { NamedChunk } from "../../code-search/embedding/_base/NamedChunk";
import { TeamTermService } from "../../domain/TeamTermService";

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

		// fill detail to query
		// TeamTermService.instance()

		let evaluateOutput: StrategyOutput | undefined = undefined;
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

		if (evaluateOutput.chunks.length > 0) {
			channel.append("\n");
			channel.appendLine("Found " + evaluateOutput.chunks.length + " code snippets\n");
			for (let chunk of evaluateOutput.chunks) {
				// a file path will be like: `build.gradle.kts (0-5)`, we need to parse range from name
				let rangeResult = chunk.name.match(/\((\d+)-(\d+)\)/);

				let start = rangeResult ? parseInt(rangeResult[1]) : 0;
				let end = rangeResult ? parseInt(rangeResult[2]) : chunk.text.length;

				channel.appendLine("File: " + chunk.path + " (" + start + " - " + end + ")");
			}
		}
	}
}
