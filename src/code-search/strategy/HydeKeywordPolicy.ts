import { HydeStrategy, HydeQuery } from "./_base/HydeStrategy";
import { ChunkItem, Embedding } from "../embedding/_base/Embedding";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";

export class HydeKeywordPolicy implements HydeStrategy<string[]> {

	instruction(): string {
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