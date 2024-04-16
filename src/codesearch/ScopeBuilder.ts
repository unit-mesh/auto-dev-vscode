import { LanguageConfig } from "../codecontext/_base/LanguageConfig";
import { Query, SyntaxNode } from "web-tree-sitter";

export enum Scoping {
	Global,
	Hoisted,
	Local,
}

export interface LocalDefCapture {
	index: number;
	symbol: string | null;
	scoping: Scoping;
}

export interface LocalRefCapture {
	index: number;
	symbol: string | null;
}

export class ScopingError extends Error {}

function parseScoping(s: string): Scoping {
	switch (s) {
		case "hoist":
			return Scoping.Hoisted;
		case "global":
			return Scoping.Global;
		case "local":
			return Scoping.Local;
		default:
			throw new ScopingError(s);
	}
}

export class ScopeBuilder {
	private query: Query;
	private rootNode: SyntaxNode;
	private sourceCode: string;
	private language: LanguageConfig;

		constructor(query: Query, rootNode: SyntaxNode, sourceCode: string, language: LanguageConfig) {
			this.query = query;
			this.rootNode = rootNode;
			this.sourceCode = sourceCode;
			this.language = language;
		}

		async build() {
			let namespaces = this.language.namespaces;


		}
}
