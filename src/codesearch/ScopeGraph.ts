import Graph from "graphology";
import { SyntaxNode } from "web-tree-sitter";

import { Point, TextRange } from "./model/TextRange";
import { LocalScope, ScopeStack } from "./scope/LocalScope";
import { LocalImport } from "./scope/LocalImport";
import { LocalDef } from "./scope/LocalDef";
import { Reference } from "./scope/Reference";
import { NodeKind } from "./scope/NodeKind";
import { ScopeBuilder } from "./ScopeBuilder";

// type Attributes = {[name: string]: any};
// // Describes the relation between two nodes in the ScopeGraph
// export enum EdgeKind {
// 	// The edge weight from a nested scope to its parent scope
// 	ScopeToScope = ScopeToScope,
//
// 	// The edge weight from a definition to its definition scope
// 	DefToScope = 'DefToScope',
//
// 	// The edge weight from an import to its definition scope
// 	ImportToScope = 'ImportToScope',
//
// 	// The edge weight from a reference to its definition
// 	RefToDef = 'RefToDef',
//
// 	// The edge weight from a reference to its import
// 	RefToImport = 'RefToImport',
// }
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

export class ScopeGraph {
	private langIndex: number;
	graph: Graph<NodeKind>;
	private currentIndex: string;

	constructor(rootNode: SyntaxNode, langIndex: number) {
		this.graph = new Graph();
		const range = TextRange.from(rootNode);
		let localScope = new LocalScope(range);
		const index = this.graph.nodes().length + 1;
		this.graph.addNode(index, localScope);
		this.currentIndex = index.toString();

		this.langIndex = langIndex;
	}

	insertLocalScope(scope: LocalScope) {
		let parentScope = this.scopeByRange(scope.range, this.currentIndex);
		if (parentScope) {
			const indexId = this.graph.nodes().length + 1;
			this.graph.addNode(indexId, scope);
			this.graph.addEdge(indexId, parentScope, new ScopeToScope);
		}
	}

	insertLocalDef(localDef: LocalDef) {
		const definingScope = this.scopeByRange(localDef.range, this.currentIndex);
		if (definingScope) {
			const indexId = this.graph.nodes().length + 1;
			this.graph.addNode(indexId, localDef);
			this.graph.addEdge(indexId, definingScope, new DefToScope);
		}
	}

	insertLocalImport(import_: LocalImport) {
		const definingScope = this.scopeByRange(import_.range, this.currentIndex);
		if (definingScope) {
			const indexId = this.graph.nodes().length + 1;
			this.graph.addNode(indexId, import_);
			this.graph.addEdge(indexId, definingScope, new ImportToScope);
		}
	}

	insertHoistedDef(localDef: LocalDef) {
		const definingScope = this.scopeByRange(localDef.range, this.currentIndex);
		if (definingScope) {
			const indexId = this.graph.nodes().length + 1;
			this.graph.addNode(indexId, localDef);
			const parentScope = this.scopeByRange(localDef.range, definingScope) || definingScope;
			this.graph.addEdge(indexId, parentScope, new DefToScope);
		}
	}

	insertGlobalDef(localDef: LocalDef) {
		const indexId = this.graph.nodes().length + 1;
		this.graph.addNode(indexId, localDef);
		this.graph.addEdge(indexId, this.currentIndex, new DefToScope);
	}

	insertRef(ref_: Reference, sourceCode: string) {
		let possibleDefs = [];
		let possibleImports = [];
		const localScopeIndex = this.scopeByRange(ref_.range, this.currentIndex);
		if (localScopeIndex) {
			for (const scope of this.scopeStack(localScopeIndex)) {
				for (const localDef of this.graph.inNeighbors(scope)) {
					if (this.graph.getEdgeAttributes(localDef, scope) === DefToScope) {
						const def = this.graph.getNodeAttributes(localDef) as LocalDef;
						if (ref_.name(sourceCode) === def.name(sourceCode)) {
							if (def.symbolId && ref_.symbolId && def.symbolId.namespaceIndex !== ref_.symbolId.namespaceIndex) {
								// both contain symbols, but they don't belong to the same namepspace
							} else {
								possibleDefs.push(localDef);
							}
						}
					}
				}

				for (const localImport of this.graph.inNeighbors(scope)) {
					if (this.graph.getEdgeAttributes(localImport, scope) === ImportToScope) {
						const import_ = this.graph.getNodeAttributes(localImport);
						if (ref_.name(sourceCode) === import_.name(sourceCode)) {
							possibleImports.push(localImport);
						}
					}
				}
			}
		}

		if (possibleDefs.length > 0 || possibleImports.length > 0) {
			const refIndex = this.graph.nodes().length + 1;
			this.graph.addNode(refIndex, ref_);
			for (const defIndex of possibleDefs) {
				this.graph.addEdge(refIndex, defIndex, new RefToDef);
			}
			for (const impIndex of possibleImports) {
				this.graph.addEdge(refIndex, impIndex, new RefToDef);
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
}