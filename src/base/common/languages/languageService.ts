/* eslint-disable @typescript-eslint/naming-convention */

/* eslint-disable curly */
import { inject, injectable } from 'inversify';
import { type TextDocument } from 'vscode';
import Parser from 'web-tree-sitter';

import { TreeSitterLoader } from 'base/node/tree-sitter/treeSitterLoader';

import { WorkspaceFileSystem } from '../fs';
import { ServiceIdentifier } from '../instantiation/instantiation';
import { isSupportedLanguage, LanguageIdentifier } from './languages';

export const ILanguageServiceProvider: ServiceIdentifier<ILanguageServiceProvider> = Symbol('LanguageServiceProvider');

export interface ILanguageServiceProvider {
	isSupportLanguage(identifier: LanguageIdentifier): boolean;

	ready(): Promise<void>;

	parse(identifier: LanguageIdentifier, input: string): Promise<Parser.Tree | undefined>;
	parseTextDocument(document: TextDocument): Promise<Parser.Tree | undefined>;

	getParser(identifier: LanguageIdentifier): Promise<Parser | undefined>;
	getLanguage(identifier: LanguageIdentifier): Promise<Parser.Language | undefined>;

	dispose(): void;
}

@injectable()
export class LanguageServiceProvider implements ILanguageServiceProvider {
	private _loader: TreeSitterLoader;

	constructor(
		@inject(WorkspaceFileSystem)
		fs: WorkspaceFileSystem,
	) {
		this._loader = new TreeSitterLoader({
			readFile: path => fs.readFile(path),
		});
	}

	ready() {
		return this._loader.ready();
	}

	async parse(identifier: LanguageIdentifier, input: string) {
		if (this.isSupportLanguage(identifier)) {
			return;
		}

		return this._loader.parse(identifier, input);
	}

	async parseTextDocument(document: TextDocument) {
		return this.parse(document.languageId, document.getText());
	}

	getParser(identifier: LanguageIdentifier): Promise<Parser | undefined> {
		if (this.isSupportLanguage(identifier)) {
			return this._loader.getLanguageParser(identifier);
		}

		return Promise.resolve(undefined);
	}

	async getLanguage(identifier: LanguageIdentifier): Promise<Parser.Language | undefined> {
		const parser = await this.getParser(identifier);
		return parser?.getLanguage();
	}

	isSupportLanguage(identifier: LanguageIdentifier) {
		return isSupportedLanguage(identifier);
	}

	dispose() {
		this._loader.dispose();
	}
}
