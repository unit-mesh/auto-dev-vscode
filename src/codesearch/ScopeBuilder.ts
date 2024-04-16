import { LanguageConfig } from "../codecontext/_base/LanguageConfig";
import { Query, SyntaxNode } from "web-tree-sitter";
import { ALL_LANGUAGES } from "../codecontext/TSLanguageUtil";
import { TextRange } from "./model/TextRange";
import { LocalImport } from "./scope/LocalImport";
import { LocalScope } from "./scope/LocalScope";
import { LocalDef } from "./scope/LocalDef";
import { Reference } from "./scope/Reference";
import { symbolIdOf } from "./model/Namespace";
import { ScopeGraph } from "./ScopeGraph";

export enum Scoping {
	Global = "Global",
	Hoisted = "Hoisted",
	Local = "Local"
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

export class ScopingError extends Error {
}

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
		let localScopeCaptureIndex: number | null = null;
		let localImportCaptureIndex: number | null = null;

		for (let i = 0; i < this.query.captureNames.length; i++) {
			const name = this.query.captureNames[i];
			const parts = name.split('.');
			const partLength = parts.length;
			console.log(parts)
			switch (parts[0]) {
				case "local":
					switch (partLength) {
						case 2:
							switch (parts[1]) {
								case "reference":
									localRefCaptures.push({ index: i, symbol: undefined });
									break;
								case "scope":
									localScopeCaptureIndex = i;
									break;
								case "import":
									localImportCaptureIndex = i;
									break;
							}

							break;
						case 3:
							if (parts[1] === "reference") {
								localRefCaptures.push({ index: i, symbol: parts[2] });
							}
							break;
					}
					break;
				default:
					switch (parts[1]) {
						case "definition":
							if (partLength === 2) {
								localDefCaptures.push({
									index: i,
									symbol: undefined,
									scoping: parseScoping(parts[0]),
								});
							} else if (partLength === 3) {
								localDefCaptures.push({
									index: i,
									symbol: parts[2],
									scoping: parseScoping(parts[0]),
								});
							}

							break;
						default:
							if (!name.startsWith("_")) {
								console.warn(`Unknown capture name: ${name}`);
							}
					}
					break;
			}
		}

		console.log(localDefCaptures);
		console.log(localRefCaptures);


		const langId = ALL_LANGUAGES.findIndex(l =>
			l.languageIds === this.languageConfig.languageIds
		);
		const scopeGraph = new ScopeGraph(this.rootNode, langId);

		const captures = this.query.captures(this.rootNode);

		const captureMap: { [index: number]: TextRange[] } = {};
		for (let index = 0; index < captures.length; index++) {
			const capture = captures[index];
			const range: TextRange = TextRange.from(capture.node);
			if (!captureMap[index]) {
				captureMap[index] = [];
			}

			captureMap[index].push(range);
		}

		console.log(JSON.stringify(captureMap));
		if (localScopeCaptureIndex !== null && captureMap[localScopeCaptureIndex]) {
			captureMap[localScopeCaptureIndex].forEach(range => {
				const scope = new LocalScope(range);
				scopeGraph.insertLocalScope(scope);
			});
		}

		console.log(localImportCaptureIndex);
		if (localImportCaptureIndex !== null && captureMap[localImportCaptureIndex]) {
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
					console.log(`localDef: ${JSON.stringify(localDef)}`);

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
