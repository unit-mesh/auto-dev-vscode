import { ChunkItem } from "../embedding/_base/Embedding";
import { HydeQuery, HydeStrategy } from "./_base/HydeStrategy";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";
import { AutoDevExtension } from "../../AutoDevExtension";

/**
 * Generate hypothetical document base on user input, and then used to retrieve similar code by symbols.
 */
export class HydeCodeStrategy implements HydeStrategy<string> {
	documentType = HydeDocumentType.Code;
	query: string;
	extension: AutoDevExtension;

	constructor(query: string, extension: AutoDevExtension) {
		this.query = query;
		this.extension = extension;
	}

	instruction(): Promise<string> {
		return Promise.resolve("");
	}

	async generateDocument(): Promise<HydeDocument<string>> {
		return new HydeDocument(HydeDocumentType.Code, "");
	}

	async retrieveChunks(condition: HydeQuery): Promise<ChunkItem[]> {
		return [];
	}

	async clusterChunks(docs: ChunkItem[]): Promise<ChunkItem[]> {
		return [];
	}
}