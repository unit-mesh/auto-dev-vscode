import { RelatedProvider } from "./RelatedProvider";
import { CodeFile } from "../../codemodel/CodeFile";
import { CodeFileCacheManager } from "../../cache/CodeFileCacheManager";

export class JavaRelatedProvider implements RelatedProvider {
	file: CodeFile;
	nodeImportMap: Map<string, CodeFile> = new Map();
	// dynamic get resources
	private fileManager: CodeFileCacheManager;

	constructor(file: CodeFile, fileManager: CodeFileCacheManager) {
		this.file = file;
		this.fileManager = fileManager;

		// lookup file imports and recentlyDocuments
	}

	inputParameters(symbol: string): CodeFile[] {
		return [];
	}

	outputTypes(symbol: string): CodeFile[] {
		return [];
	}
}