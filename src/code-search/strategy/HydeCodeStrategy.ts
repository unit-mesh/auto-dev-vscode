import { Embedding, ChunkItem } from "../embedding/_base/Embedding";
import { HydeStrategy, HydeQuery } from "./_base/HydeStrategy";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";

/**
 * Generate hypothetical document base on user input, and then used to retrieve similar code by symbols.
 */
export class HydeCodeStrategy implements HydeStrategy<string> {
	instruction(userInput: string): string {
		return "";
	}

	generateDocument(): HydeDocument<string> {
		return new HydeDocument(HydeDocumentType.Code, "");
	}

	embedDocument(doc: HydeDocument<string>): Embedding {
		return [];
	}

	clusterChunks(docs: HydeDocument<string>[]): Embedding[] {
		return [];
	}

	retrieveChunks(condition: HydeQuery): ChunkItem[] {
		return [];
	}
}