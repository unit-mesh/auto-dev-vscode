import { HydeQuery, HydeStrategy } from "./_base/HydeStrategy";
import { ChunkItem, Embedding } from "../embedding/_base/Embedding";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";

/**
 * Generate keywords from the query, and then used to retrieve similar code by symbols.
 *
 * Should set prioritize for the text code aka {@link TextDocument}.

 * - High: Current Document
 * - Medium: Recently Documents
 * - Low: All Documents
 */
export class HydeKeywordsStrategy implements HydeStrategy<string[]> {
	constructor() {
		// PromptManager.getInstance().generateTemplateString()
	}

	instruction(userInput: string): string {
		return "";
	}

	clusterChunks(docs: HydeDocument<string[]>[]): Embedding[] {
		return [];
	}

	embedDocument(doc: HydeDocument<string[]>): Embedding {
		return [];
	}

	generateDocument(): HydeDocument<string[]> {
		return new HydeDocument(HydeDocumentType.Code, []);
	}

	retrieveChunks(condition: HydeQuery): ChunkItem[] {
		return [];
	}
}
