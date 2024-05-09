import { Query, SyntaxNode } from "web-tree-sitter";

import { LanguageProfile } from "../../code-context/_base/LanguageProfile";
import { TextRange } from "./model/TextRange";
import { LocalImport } from "./node/LocalImport";
import { LocalScope } from "./node/LocalScope";
import { LocalDef } from "./node/LocalDef";
import { Reference } from "./node/Reference";
import { ScopeGraph } from "./ScopeGraph";
import { symbolIdOf } from "./model/SymbolId";

export enum Scoping {
	global = "global",
	hoisted = "hoisted",
	local = "local"
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
			return Scoping.hoisted;
		case "global":
			return Scoping.global;
		case "local":
			return Scoping.local;
		default:
			throw new ScopingError(s);
	}
}

export class ScopeBuilder {
	private rootNode: SyntaxNode;
	private sourceCode: string;
	private languageConfig: LanguageProfile;
	private query: Query;

	constructor(query: Query, rootNode: SyntaxNode, sourceCode: string, languageConfig: LanguageProfile) {
		this.query = query;
		this.rootNode = rootNode;
		this.sourceCode = sourceCode;
		this.languageConfig = languageConfig;
	}

	async build() : Promise<ScopeGraph> {
		let namespaces = this.languageConfig.namespaces;

		const localDefCaptures: LocalDefCapture[] = [];
		const localRefCaptures: LocalRefCapture[] = [];
		let localScopeCaptureIndex: number | null = null;
		let localImportCaptureIndex: number | null = null;

		for (let index = 0; index < this.query.captureNames.length; index++) {
			const name = this.query.captureNames[index];
			const parts = name.split('.');
			const partLength = parts.length;

			if (parts[0] === "local") {
				handleLocalParts(parts, partLength, index);
			} else {
				handleDefinitionParts(parts, index);
			}
		}

		function handleLocalParts(parts: string[], partLength: number, index: number) {
			switch (partLength) {
				case 2:
					handleLocalPartsLengthTwo(parts, index);
					break;
				case 3:
					handleDefinitionAndReference(parts, index);
					break;
			}
		}

		function handleLocalPartsLengthTwo(parts: string[], index: number) {
			switch (parts[1]) {
				case "reference":
					localRefCaptures.push({ index: index, symbol: undefined });
					break;
				case "scope":
					localScopeCaptureIndex = index;
					break;
				case "import":
					localImportCaptureIndex = index;
					break;
			}
		}

		function handleDefinitionAndReference(parts: string[], index: number) {
			switch (parts[1]) {
				case "reference":
					localRefCaptures.push({ index: index, symbol: parts[2] });
					break;
				case "definition":
					localDefCaptures.push({
						index: index,
						symbol: parts[2],
						scoping: Scoping.local,
					});
					break;
				default:
					warnUnknownCaptureName(parts[0]);
			}
		}

		function handleDefinitionParts(parts: string[], i: number) {
			switch (parts[1]) {
				case "definition":
					localDefCaptures.push({
						index: i,
						symbol: parts[2] || undefined,
						scoping: parseScoping(parts[0]),
					});
					break;
				default:
					warnUnknownCaptureName(parts[0]);
			}
		}

		function warnUnknownCaptureName(name: string) {
			if (!name.startsWith("_")) {
				console.warn(`Unknown capture name: ${name}`);
			}
		}

		const scopeGraph = new ScopeGraph(this.rootNode, this.languageConfig);
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
						case Scoping.hoisted:
							scopeGraph.insertHoistedDef(localDef);
							break;
						case Scoping.global:
							scopeGraph.insertGlobalDef(localDef);
							break;
						case Scoping.local:
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
