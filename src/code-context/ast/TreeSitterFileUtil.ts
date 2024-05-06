import vscode from "vscode";
import { TreeSitterFile } from "./TreeSitterFile";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";
import { TreeSitterFileManager } from "../../editor/cache/TreeSitterFileManager";

/**
 * Converts a given VSCode {@link TextDocument} into a TreeSitterFile.
 *
 * @param document The VSCode {@link TextDocument} to convert.
 * @returns The TreeSitterFile representation of the document, or null if the conversion fails.
 */
export async function documentToTreeSitterFile(document: vscode.TextDocument) {
	const cached = TreeSitterFileManager.getInstance().getDocument(document.uri);
	if (cached) {
		return cached;
	}

	const src = document.getText();
	const langId = document.languageId;

	const file = await TreeSitterFile.create(src, langId, new DefaultLanguageService(), document.uri.fsPath);
	TreeSitterFileManager.getInstance().setDocument(document.uri,file);
	return file;
}

export async function toNamedElementBuilder(document: vscode.TextDocument): Promise<NamedElementBuilder> {
	let file = await documentToTreeSitterFile(document);
	return new NamedElementBuilder(file);
}
