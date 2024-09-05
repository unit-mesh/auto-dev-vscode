import { AutoDevExtension } from 'src/AutoDevExtension';
import { TreeSitterFile } from 'src/code-context/ast/TreeSitterFile';
import { TreeSitterFileManager } from 'src/editor/cache/TreeSitterFileManager';
import vscode, { TextDocumentChangeEvent, Uri } from 'vscode';

import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { CsharpFieldExtractor, FieldInfo } from './CsharpFieldExtractor';
import { CsharpMethodExtractor, MethodInfo } from './CsharpMethodExtractor';

export class CsharpClassExtractor {
	private fieldExtractor?: CsharpFieldExtractor;
	private methodExtractor?: CsharpMethodExtractor;

	constructor() {}
	public async Init(text: vscode.TextDocument, autoDev: AutoDevExtension) {
		let parser = await autoDev.treeSitterFileManager.create(text);
		this.fieldExtractor = new CsharpFieldExtractor(text, parser);
		this.methodExtractor = new CsharpMethodExtractor(text, parser);
	}
	public extractClassInfo(): ClassInfo | null {
		if (this.fieldExtractor == null || this.methodExtractor == null) return null;

		const fields = this.fieldExtractor.extractFields();
		const methods = this.methodExtractor.extractMethods();

		return {
			fields,
			methods,
		};
	}
}

export interface ClassInfo {
	fields: FieldInfo[];
	methods: MethodInfo[];
}
