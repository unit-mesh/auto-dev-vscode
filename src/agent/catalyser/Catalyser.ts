import { ContextItem, retrieveContextItemsFromEmbeddings } from "../../code-search/retrieval/DefaultRetrieval";
import { AutoDevExtension } from "../../AutoDevExtension";
import { channel } from "../../channel";

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
		let result = await retrieveContextItemsFromEmbeddings(query, this.extension.ideAction, this.extension.embeddingsProvider!!, undefined);
		result.forEach((item: ContextItem) => {
			channel.appendLine(JSON.stringify(item));
		});
	}

}