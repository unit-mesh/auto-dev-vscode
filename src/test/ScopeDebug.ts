import Graph from "graphology";

import { TextRange } from "../code-search/model/TextRange";
import { LanguageConfig } from "../code-context/_base/LanguageConfig";
import { NodeKind } from "../code-search/scope/NodeKind";
import { DefToScope, EdgeKind, ImportToScope, RefToDef, RefToImport, ScopeToScope } from "../code-search/ScopeGraph";
import { LocalDef } from "../code-search/scope/LocalDef";
import { nameOfSymbol } from "../code-search/model/Namespace";

export class RefDebug {
	context: string;

	constructor(context: string) {
		this.context = context;
	}

	toString(): string {
		return this.context;
	}
}

export class DefDebug {
	private context: string;
	name: string;
	range: TextRange;
	refs: RefDebug[];
	symbol: string;

	constructor(range: TextRange, name: string, refs: TextRange[], symbol: string, src: string) {
		this.name = name;
		this.range = range;
		this.context = contextFromRange(range, src); // Assuming context is defined elsewhere
		this.refs = refs.map(r => contextFromRange(r, src)).map(context => new RefDebug(context));
		this.symbol = symbol;
	}

	toString(): string {
		return JSON.stringify({
			name: this.name,
			kind: this.symbol,
			context: this.context,
			references: this.refs
		});
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
		this.context = contextFromRange(range, src);
		this.refs = refs.map(r => contextFromRange(r, src)).map(context => new RefDebug(context));
	}

	toString(): string {
		return JSON.stringify({
			name: this.name,
			context: this.context,
			references: this.refs
		});
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
					.filter(edge => graph.getEdgeAttributes(edge) instanceof RefToDef)
					.map(edge => graph.getNodeAttributes(graph.source(edge)).range)
					.sort();

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
		const scopes = '[' + this.scopes.map(s => s.toString()).join(", ")  + ']';
		return JSON.stringify({
			definitions: this.defs,
			imports: this.imports,
			scopes: JSON.parse(scopes)
		});
	}
}

function contextFromRange(range: TextRange, src: string): string {
	const contextStart = (() => {
		for (let i = range.start.byte - 1; i >= 0; i--) {
			if (src[i] === "\n") {
				return i + 1;
			}
		}
		return 0;
	})();

	// first new line after end
	const contextEnd = (() => {
		for (let i = range.end.byte; i < src.length; i++) {
			if (src[i] === "\n") {
				return i;
			}
		}
		return src.length;
	})();


	return [
		src.slice(contextStart, range.start.byte).trimStart(),
		src.slice(range.start.byte, range.end.byte),
		src.slice(range.end.byte, contextEnd).trimEnd(),
	].join("§");
}
