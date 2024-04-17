import Graph from "graphology";

import { TextRange } from "../codesearch/model/TextRange";
import { LanguageConfig } from "../codecontext/_base/LanguageConfig";
import { NodeKind } from "../codesearch/scope/NodeKind";
import { DefToScope, EdgeKind, ImportToScope, RefToDef, RefToImport, ScopeToScope } from "../codesearch/ScopeGraph";
import { LocalDef } from "../codesearch/scope/LocalDef";
import { nameOfSymbol } from "../codesearch/model/Namespace";

export class RefDebug {
	context: string;

	constructor(context: string) {
		this.context = context;
	}

	toString(): string {
		return `\`${this.context}\``;
	}
}

export class DefDebug {
	name: string;
	range: TextRange;
	private context: string;
	refs: RefDebug[];
	symbol: string;

	constructor(range: TextRange, name: string, refs: TextRange[], symbol: string, src: string) {
		this.name = name;
		this.range = range;
		this.context = context(range, src); // Assuming context is defined elsewhere
		this.refs = refs.map(r => context(r, src)).map(context => new RefDebug(context));
		this.symbol = symbol;
	}

	toString(): string {
		let result = `${this.name} { kind: ${this.symbol}, context: ${this.context}`;

		if (this.refs.length > 0) {
			result += `, referenced in (${this.refs.length}) { ${this.refs.join(', ')} }`;
		}

		result += " }";

		return result;
	}
}

export class ImportDebug {
	name: string;
	range: TextRange;
	context: string;
	refs: RefDebug[];

	constructor(name: string, range: TextRange, refs: TextRange[], src: string) {
		this.name = name;
		this.range = range;
		this.context = context(range, src);
		this.refs = refs.map(r => context(r, src)).map(context => new RefDebug(context));
	}

	toString(): string {
		let result = `${this.name} { context: ${this.context}`;

		if (this.refs.length > 0) {
			result += `, referenced in (${this.refs.length}) { ${this.refs.join(', ')} }`;
		}

		result += " }";

		return result;
	}
}

export class ScopeDebug {
	range: TextRange;
	defs: DefDebug[];
	imports: ImportDebug[];
	scopes: ScopeDebug[];
	private language: LanguageConfig;

	constructor(range: TextRange, language: LanguageConfig) {
		this.range = range;
		this.defs = [];
		this.imports = [];
		this.scopes = [];
		this.language = language;
	}

	public static new(
		graph: Graph<NodeKind, EdgeKind>,
		start: string,
		src: string,
		language: LanguageConfig,
	): ScopeDebug {
		const scopeDebug = new ScopeDebug(graph.getNodeAttributes(start).range, language);
		scopeDebug.build(graph, start, src);
		return scopeDebug;
	}

	build(graph: Graph<NodeKind>, start: any, src: string) {
		const defs = graph
			.inEdges(start)
			.filter(edge => graph.getEdgeAttributes(edge) instanceof DefToScope)
			.map(edge => {
				const defNode = graph.source(edge);
				const range = graph.getNodeAttributes(defNode).range;
				const text = src.slice(range.start.byte, range.end.byte);
				const refs = graph
					.inEdges(defNode)
					.filter(edge => graph.getEdgeAttributes(edge) === RefToDef)
					.map(edge => graph.getNodeAttributes(graph.source(edge)).range)
					.sort((a, b) => a.start.byte - b.start.byte);

				let localDef = graph.getNodeAttributes(defNode) as LocalDef;
				let symbol;
				if (localDef.symbolId) {
					symbol = nameOfSymbol(localDef.symbolId, this.language.namespaces);
				} else {
					symbol = "none";
				}

				return new DefDebug(range, text, refs, symbol, src);
			});

		const imports = graph
			.inEdges(start)
			.filter(edge => graph.getEdgeAttributes(edge) instanceof ImportToScope)
			.map(edge => {
				const impNode = graph.source(edge);
				const range = graph.getNodeAttributes(impNode).range;
				const text = src.slice(range.start.byte, range.end.byte);
				const refs = graph
					.inEdges(impNode)
					.filter(edge => graph.getEdgeAttributes(edge) instanceof RefToImport)
					.map(edge => graph.getNodeAttributes(graph.source(edge)).range)
					.sort((a, b) => a.start.byte - b.start.byte);

				return new ImportDebug(text, range, refs, src);
			});

		const scopes = graph
			.inEdges(start)
			.filter(edge => graph.getEdgeAttributes(edge) instanceof ScopeToScope)
			.map(edge => {
				const sourceScope = graph.source(edge);
				const scopeDebug = new ScopeDebug(graph.getNodeAttributes(sourceScope).range, this.language);
				scopeDebug.build(graph, sourceScope, src);
				return scopeDebug;
			});

		this.defs = defs.sort((a, b) => a.range.compare(b.range));
		this.imports = imports.sort((a, b) => a.range.compare(b.range));
		this.scopes = scopes.sort((a, b) => a.range.compare(b.range));
	}

	toString(): string {
		if (this.imports.length === 0) {
			return `scope {\n definitions: ${this.defs.map(s => s.toString())},\n child scopes: ${this.scopes.map(s => s.toString())}\n }`;
		} else {
			return `scope {\n definitions: ${this.defs.map(s => s.toString())},\n imports: ${this.imports.map(s => s.toString())},\n child scopes: ${this.scopes}\n }`;
		}
	}
}

export function context(range: TextRange, src: string): string {
	const contextStart = src
		.split("")
		.slice(0, range.start.byte)
		.reverse()
		.findIndex(c => c === "\n");

	const contentEnd = src
		.split("")
		.slice(range.end.byte)
		.findIndex(c => c === "\n");

	return [
		src.slice(contextStart + 1, range.start.byte).trimStart(),
		src.slice(range.start.byte, range.end.byte),
		src.slice(range.end.byte, contentEnd).trimEnd(),
	].join("§");
}
