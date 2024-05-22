import vscode from "vscode";
import { TreeSitterFile } from "./TreeSitterFile";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";
import { TreeSitterFileManager } from "../../editor/cache/TreeSitterFileManager";

/**
 * For fix generate code
 */
export async function textToTreeSitterFile(src: string, langId: string) {
	return TreeSitterFile.create(src, langId, new DefaultLanguageService());
}

export async function createNamedElement(document: vscode.TextDocument): Promise<NamedElementBuilder> {
	let file = await TreeSitterFileManager.create(document);
	return new NamedElementBuilder(file);
}

export async function createTreeSitterFile(document: vscode.TextDocument): Promise<TreeSitterFile> {
	return TreeSitterFileManager.create(document);
}