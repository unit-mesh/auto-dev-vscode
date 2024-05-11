import { ChunkItem } from "../embedding/_base/Embedding";
import { HydeQuery, HydeStrategy } from "./_base/HydeStrategy";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";

/**
 * Generate hypothetical document base on user input, and then used to retrieve similar code by symbols.
 */
export class HydeCodeStrategy implements HydeStrategy<string> {
	documentType = HydeDocumentType.Code;

	instruction(userInput: string): Promise<string> {
		return Promise.resolve("");
	}

	async generateDocument(): Promise<HydeDocument<string>> {
		return new HydeDocument(HydeDocumentType.Code, "");
	}

	async clusterChunks(docs: HydeDocument<string>[]): Promise<ChunkItem[]> {
		return [];
	}

	async retrieveChunks(condition: HydeQuery): Promise<ChunkItem[]> {
		return [];
	}
}