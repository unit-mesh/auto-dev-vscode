import { LanguageConfig } from "../codecontext/_base/LanguageConfig";
import { Language, Query, SyntaxNode } from "web-tree-sitter";
import { ALL_LANGUAGES } from "../codecontext/TSLanguageUtil";
import { TextRange } from "./model/TextRange";
import { LocalImport } from "./scope/LocalImport";
import { LocalScope } from "./scope/LocalScope";
import { LocalDef } from "./scope/LocalDef";
import { Reference } from "./scope/Reference";
import { symbolIdOf } from "./model/Namespace";
import { ScopeGraph } from "./ScopeGraph";

export enum Scoping {
	Global,
	Hoisted,
	Local,
}

export interface LocalDefCapture {
	index: number;
	symbol: string | undefined | null;
	scoping: Scoping;
}

export interface LocalRefCapture {
	index: number;
	symbol: string | undefined | null;
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
	private rootNode: SyntaxNode;
	private sourceCode: string;
	private languageConfig: LanguageConfig;
	private query: Query;

	constructor(query: Query, rootNode: SyntaxNode, sourceCode: string, languageConfig: LanguageConfig) {
		this.query = query;
		this.rootNode = rootNode;
		this.sourceCode = sourceCode;
		this.languageConfig = languageConfig;
	}

	async build() {
		let namespaces = this.languageConfig.namespaces;

		const localDefCaptures: LocalDefCapture[] = [];
		const localRefCaptures: LocalRefCapture[] = [];

		const parts = this.query.captureNames.map(name => name.split('.'));

		for (let i = 0; i < parts.length; i++) {
			const [scoping, action, sym] = parts[i];
			switch (action) {
				case "definition": {
					const index = i;
					const symbol = sym ? sym : undefined;
					const scopingEnum = parseScoping(scoping);
					if (scopingEnum) {
						const l: LocalDefCapture = { index, symbol, scoping: scopingEnum };
						localDefCaptures.push(l);
					}
					break;
				}
				case "reference": {
					const index = i;
					const symbol = sym ? sym : undefined;
					const l: LocalRefCapture = { index, symbol };
					localRefCaptures.push(l);
					break;
				}
				default:
					break;
			}
		}

		const captures = this.query.captures(this.rootNode);

		const langId = ALL_LANGUAGES.findIndex(l =>
			l.languageIds === this.languageConfig.languageIds
		);
		const scopeGraph = new ScopeGraph(this.rootNode, langId);

		const captureMap: { [index: number]: TextRange[] } = {};
		for (let index = 0; index < captures.length; index++) {
			const capture = captures[index];
			const range: TextRange = TextRange.from(capture.node);
			if (!captureMap[index]) {
				captureMap[index] = [];
			}

			captureMap[index].push(range);
		}

		const localScopeCaptureIndex = parts.findIndex(([action]) => action === "scope");
		if (localScopeCaptureIndex !== -1 && captureMap[localScopeCaptureIndex]) {
			captureMap[localScopeCaptureIndex].forEach(range => {
				const scope = new LocalScope(range);
				scopeGraph.insertLocalScope(scope);
			});
		}

		const localImportCaptureIndex = parts.findIndex(([action]) => action === "import");
		if (localImportCaptureIndex !== -1 && captureMap[localImportCaptureIndex]) {
			captureMap[localImportCaptureIndex].forEach(range => {
				const import_ = new LocalImport(range);
				scopeGraph.insertLocalImport(import_);
			});
		}

		localDefCaptures.forEach(({ index, symbol, scoping }) => {
			const ranges = captureMap[index];
			if (ranges) {
				ranges.forEach(range => {
					const symbolId = symbol ? symbolIdOf(namespaces, symbol) : undefined;
					const localDef = new LocalDef(range, symbolId!!);

					switch (scoping) {
						case Scoping.Hoisted:
							scopeGraph.insertHoistedDef(localDef);
							break;
						case Scoping.Global:
							scopeGraph.insertGlobalDef(localDef);
							break;
						case Scoping.Local:
							scopeGraph.insertLocalDef(localDef);
							break;
					}
				});
			}
		});

		localRefCaptures.forEach(({ index, symbol }) => {
			const ranges = captureMap[index];
			if (ranges) {
				ranges.forEach(range => {
					const symbolId = symbol ? symbolIdOf(namespaces, symbol) : undefined;
					const ref_ = new Reference(range, symbolId!!);

					scopeGraph.insertRef(ref_, this.sourceCode);
				});
			}
		});

		return scopeGraph;
	}
}
