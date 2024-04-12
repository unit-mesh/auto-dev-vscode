import { RelatedProvider } from "./RelatedProvider";
import { CodeFile } from "../../codemodel/CodeFile";
import { RecentlyDocumentManager } from "../../document/RecentlyDocumentManager";

export class JavaRelatedProvider implements RelatedProvider {
	file: CodeFile;
	nodeImportMap: Map<string, string> = new Map();
	private documentManager: RecentlyDocumentManager;

	constructor(file: CodeFile, documentManager: RecentlyDocumentManager) {
		this.file = file;
		this.documentManager = documentManager;

		// lookup file imports and recentlyDocuments
	}

	fanIn(symbol: string): CodeFile[] {
		return [];
	}

	fanOut(symbol: string): CodeFile[] {
		return [];
	}
}