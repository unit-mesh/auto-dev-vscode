import vscode from "vscode";
import { TreeSitterFile } from "./TreeSitterFile";

export async function documentToTreeSitterFile(document: vscode.TextDocument) {
	const cached = TreeSitterFile.cache.getDocument(document.uri, document.version);
	if (cached) {
		return cached;
	}

	const src = document.getText();
	const langId = document.languageId;

	const file = await TreeSitterFile.tryBuild(src, langId);
	TreeSitterFile.cache.setDocument(document.uri, document.version, file);
	return file;
}
