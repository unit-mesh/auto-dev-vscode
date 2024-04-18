import Graph from "graphology";
import { SyntaxNode } from "web-tree-sitter";

import { TextRange } from "./model/TextRange";
import { LocalScope, ScopeStack } from "./scope/LocalScope";
import { LocalImport } from "./scope/LocalImport";
import { LocalDef } from "./scope/LocalDef";
import { Reference } from "./scope/Reference";
import { NodeKind } from "./scope/NodeKind";
import { LanguageConfig } from "../code-context/_base/LanguageConfig";
import { ScopeDebug } from "../test/ScopeDebug";

export interface EdgeKind {
}

export class ScopeToScope implements EdgeKind {
}

export class DefToScope implements EdgeKind {
}

export class ImportToScope implements EdgeKind {
}

export class RefToDef implements EdgeKind {
}

export class RefToImport implements EdgeKind {
}

export class ScopeGraph {
	graph: Graph<NodeKind>;
	private rootIndex: string;

	constructor(rootNode: SyntaxNode, langIndex: number) {
		this.graph = new Graph();
		const range = TextRange.from(rootNode);
		let localScope = new LocalScope(range);
		const index = 0;
		this.graph.addNode(index, localScope);
		this.rootIndex = index.toString();
	}

	getNode(node: string): NodeKind {
		return this.graph.getNodeAttributes(node);
	}

	insertLocalScope(scope: LocalScope) {
		let parentScope = this.scopeByRange(scope.range, this.rootIndex);
		if (parentScope) {
			const indexId = this.graph.nodes().length + 1;
			this.graph.addNode(indexId, scope);
			this.graph.addEdge(indexId, parentScope, new ScopeToScope);
		}
	}

	insertLocalDef(localDef: LocalDef) {
		const definingScope = this.scopeByRange(localDef.range, this.rootIndex);
		if (definingScope) {
			const indexId = this.graph.nodes().length + 1;
			this.graph.addNode(indexId, localDef);
			this.graph.addEdge(indexId, definingScope, new DefToScope);
		}
	}

	insertHoistedDef(localDef: LocalDef) {
		const definingScope = this.scopeByRange(localDef.range, this.rootIndex);
		if (definingScope) {
			const newIndexId = this.graph.nodes().length + 1;
			this.graph.addNode(newIndexId, localDef);

			const targetScope = this.parentScope(definingScope) || definingScope;
			this.graph.addEdge(newIndexId, targetScope, new DefToScope);
		}
	}

	insertGlobalDef(localDef: LocalDef) {
		const indexId = this.graph.nodes().length + 1;
		this.graph.addNode(indexId, localDef);
		this.graph.addEdge(indexId, this.rootIndex, new DefToScope);
	}

	insertLocalImport(import_: LocalImport) {
		const definingScope = this.scopeByRange(import_.range, this.rootIndex);
		if (definingScope) {
			const indexId = this.graph.nodes().length + 1;
			this.graph.addNode(indexId, import_);
			this.graph.addEdge(indexId, definingScope, new ImportToScope);
		}
	}

	insertRef(reference: Reference, sourceCode: string) {
		let possibleDefs: string[] = [];
		let possibleImports: string[] = [];

		const localScopeIndex = this.scopeByRange(reference.range, this.rootIndex);
		if (localScopeIndex) {
			let stack = this.scopeStack(localScopeIndex);
			for (const scope of stack) {
				this.graph.inEdges(scope).filter(edge => {
					return this.graph.getEdgeAttributes(edge) instanceof DefToScope
				}).forEach(edge => {
					const localDef = this.graph.source(edge);
					const def = this.graph.getNodeAttributes(localDef) as LocalDef;
					if (reference.name(sourceCode) === def.name(sourceCode)) {
						if (def.symbolId && reference.symbolId && def.symbolId.namespaceIndex !== reference.symbolId.namespaceIndex) {
							// both contain symbols, but they don't belong to the same namepspace
						} else {
							possibleDefs.push(localDef);
						}
					}
				});

				this.graph.inEdges(scope).forEach(edge => {
					if (this.graph.getEdgeAttributes(edge) instanceof ImportToScope) {
						const localImport = this.graph.source(edge);
						const import_ = this.graph.getNodeAttributes(localImport) as LocalImport;
						if (reference.name(sourceCode) === import_.name(sourceCode)) {
							possibleImports.push(localImport);
						}
					}
				});
			}
		}

		if (possibleDefs.length > 0 || possibleImports.length > 0) {
			const newRef = new Reference(reference.range, reference.symbolId);
			const refIndex = this.graph.nodes().length + 1;
			this.graph.addNode(refIndex, newRef);
			for (const defIndex of possibleDefs) {
				this.graph.addEdge(refIndex, defIndex, new RefToDef);
			}
			for (const impIndex of possibleImports) {
				this.graph.addEdge(refIndex, impIndex, new RefToImport);
			}
		}
	}

	scopeStack(start: string): ScopeStack {
		return new ScopeStack(this.graph, start);
	}

	private scopeByRange(range: TextRange, start: string): string | null {
		const targetRange = this.graph.getNodeAttributes(start).range;
		if (targetRange.contains(range)) {
			const childScopes = this.graph.inNeighbors(start);
			for (const childScope of childScopes) {
				const t = this.scopeByRange(range, childScope);
				if (t !== null) {
					return t;
				}
			}

			return start;
		}
		return null;
	}

	private parentScope(start: string): string | null {
		if (this.graph.getNodeAttributes(start) instanceof LocalScope) {
			const edges = this.graph.outEdges(start);
			for (const edge of edges) {
				const target = this.graph.target(edge);
				if (this.graph.getEdgeAttributes(edge) instanceof ScopeToScope) {
					return target;
				}
			}
		}

		return null;
	}

	public hoverableRanges(): TextRange[] {
		const iterator = this.graph.nodes();
		return iterator.filter(node => {
			const nodeKind = this.graph.getNodeAttributes(node);
			return nodeKind instanceof LocalDef || nodeKind instanceof Reference || nodeKind instanceof LocalImport;
		}).map(node => {
			const nodeKind = this.graph.getNodeAttributes(node);
			return nodeKind.range;
		});
	}

	public definitions(referenceNode: string): Iterable<string> {
		const iterator = this.graph.outEdges(referenceNode);
		return iterator.filter(edge => this.graph.getEdgeAttributes(edge) instanceof RefToDef);
	}

	public imports(referenceNode: string): Iterable<string> {
		const iterator = this.graph.outEdges(referenceNode);
		return iterator.filter(edge => this.graph.getEdgeAttributes(edge) instanceof RefToImport);
	}

	public references(definitionNode: string): Iterable<string> {
		const iterator = this.graph.inEdges(definitionNode);
		return iterator.filter(edge => this.graph.getEdgeAttributes(edge) instanceof RefToDef || this.graph.getEdgeAttributes(edge) instanceof RefToImport);
	}

	public nodeByRange(startByte: number, endByte: number): string | undefined {
		return this.graph.nodes()
			.filter(node => {
				const nodeKind = this.graph.getNodeAttributes(node);
				return nodeKind instanceof LocalDef || nodeKind instanceof Reference || nodeKind instanceof LocalImport;
			})
			.find(node => {
				const nodeKind = this.graph.getNodeAttributes(node);
				return nodeKind.range.start.byte >= startByte && nodeKind.range.end.byte <= endByte;
			});
	}

	debug(src: string, language: LanguageConfig) {
		const graph = this.graph;
		const start = this.rootIndex;
		return ScopeDebug.new(graph, start, src, language);
	}
}
