import vscode from 'vscode';

import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { NamedElementBuilder } from '../../editor/ast/NamedElementBuilder';
import { TreeSitterFileManager } from '../../editor/cache/TreeSitterFileManager';
import { TreeSitterFile } from './TreeSitterFile';

/**
 * For fix generate code
 */
export async function textToTreeSitterFile(src: string, langId: string, languageService: ILanguageServiceProvider

) {
	return TreeSitterFile.create(src, langId, languageService);
}

// TODO move to AutoDevExtension?
export async function createNamedElement(
	treeSitterFileManager: TreeSitterFileManager,
	document: vscode.TextDocument,
): Promise<NamedElementBuilder> {
	const file = await treeSitterFileManager.create(document);
	return new NamedElementBuilder(file);
}

// TODO move to AutoDevExtension?
export async function createTreeSitterFile(
	treeSitterFileManager: TreeSitterFileManager,
	document: vscode.TextDocument,
): Promise<TreeSitterFile> {
	return treeSitterFileManager.create(document);
}
