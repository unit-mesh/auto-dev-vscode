import { Embedding, ChunkItem } from "../embedding/_base/Embedding";
import { HydeStrategy, HydeQuery } from "./_base/HydeStrategy";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";

export class HydeCodePolicy implements HydeStrategy<string> {
	instruction(): string {
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