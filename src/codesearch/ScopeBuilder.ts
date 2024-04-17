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
			switch (parts[0]) {
				case "local":
					switch (partLength) {
						case 2:
							switch (parts[1]) {
								// like: @local.reference
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
							// like: @local.reference.import
							switch (parts[1]) {
								case "reference":
									localRefCaptures.push({ index: i, symbol: parts[2] });
									break;
								case "definition":
									localDefCaptures.push({
										index: i,
										symbol: parts[2],
										scoping: Scoping.Local,
									});
									break;
								default:
									if (!name.startsWith("_")) {
										console.warn(`Unknown capture name: ${name}`);
									}
							}
							break;
					}
					break;
				default:
					// for Hoisted and Global
					switch (parts[1]) {
						case "definition":
							localDefCaptures.push({
								index: i,
								symbol: parts[2] || undefined,
								scoping: parseScoping(parts[0]),
							});
							break;
						default:
							if (!name.startsWith("_")) {
								console.warn(`Unknown capture name: ${name}`);
							}
					}
					break;
			}
		}

		console.debug(localDefCaptures);
		console.debug(localRefCaptures);

		const langId = ALL_LANGUAGES.findIndex(l =>
			l.languageIds === this.languageConfig.languageIds
		);

		const scopeGraph = new ScopeGraph(this.rootNode, langId);
		const captures = this.query.captures(this.rootNode);

		const captureMap: { [index: number]: TextRange[] } = captures.reduce((map: any, capture) => {
			const range = TextRange.from(capture.node);
			const index = this.query.captureNames.indexOf(capture.name);

			if (!map[index]) {
				map[index] = [];
			}

			map[index].push(range);

			return map;
		}, {});

		if (localScopeCaptureIndex !== null && captureMap[localScopeCaptureIndex]) {
			captureMap[localScopeCaptureIndex].forEach(range => {
				const scope = new LocalScope(range);
				scopeGraph.insertLocalScope(scope);
			});
		}

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
