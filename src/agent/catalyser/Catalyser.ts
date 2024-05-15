import { AutoDevExtension } from "../../AutoDevExtension";
import { channel } from "../../channel";
import { HydeKeywordsStrategy } from "../../code-search/search-strategy/HydeKeywordsStrategy";

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

	async query(query: string): Promise<void> {
		channel.append("Semantic search for code: " + query + "\n");
		let keywordsStrategy = new HydeKeywordsStrategy(query, this.extension);
		let evaluateOutput = await keywordsStrategy.execute();

		channel.appendLine("");
		channel.appendLine("Summary: ");
		channel.append(evaluateOutput);

		this.extension.sidebar?.webviewProtocol?.request("userInput", {
			input: evaluateOutput,
		});
	}
}
