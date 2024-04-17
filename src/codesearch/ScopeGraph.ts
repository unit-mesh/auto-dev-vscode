import Graph from "graphology";
import { SyntaxNode } from "web-tree-sitter";

import { Point, TextRange } from "./model/TextRange";
import { LocalScope } from "./scope/LocalScope";
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
export interface EdgeKind {}
export class ScopeToScope implements EdgeKind {}
export class DefToScope implements EdgeKind {}
export class ImportToScope implements EdgeKind {}
export class RefToDef implements EdgeKind {}

export class ScopeGraph {
	private startPosition: Point;
	private endPosition: Point;
	private langIndex: number;
	private graph: Graph<NodeKind>;
	private currentIndex : string;

	constructor(rootNode: SyntaxNode, langIndex: number) {
		this.graph = new Graph();
		const range = TextRange.from(rootNode);
		let localScope = new LocalScope(range);
		const index = this.graph.nodes().length + 1;
		this.graph.addNode(index, localScope);
		this.currentIndex = index.toString();

		this.startPosition = {
			line: rootNode.startPosition.row,
			column: rootNode.startPosition.column,
		};
		this.endPosition = {
			line: rootNode.endPosition.row,
			column: rootNode.endPosition.column,
		};
		this.langIndex = langIndex;
	}

	insertLocalScope(scope: LocalScope) {
		let parentScope = this.scopeByRange(scope.range, this.currentIndex);
		if (parentScope) {
			const index = this.graph.nodes().length + 1;
			this.graph.addNode(index, scope);
			this.graph.addEdge(index, parentScope, new ScopeToScope);
		}
	}

	insertLocalDef(localDef: LocalDef) {

	}

	insertLocalImport(import_: LocalImport) {

	}

	insertHoistedDef(localDef: LocalDef) {

	}

	insertGlobalDef(localDef: LocalDef) {

	}
	insertRef(ref_: Reference, sourceCode: string) {

	}

	// fn scope_by_range(&self, range: TextRange, start: NodeIndex) -> Option<NodeIndex> {
	//         let target_range = self.graph[start].range();
	//         if target_range.contains(&range) {
	//             let child_scopes = self
	//                 .graph
	//                 .edges_directed(start, Direction::Incoming)
	//                 .filter(|edge| *edge.weight() == EdgeKind::ScopeToScope)
	//                 .map(|edge| edge.source())
	//                 .collect::<Vec<_>>();
	//             for child_scope in child_scopes {
	//                 if let Some(t) = self.scope_by_range(range, child_scope) {
	//                     return Some(t);
	//                 }
	//             }
	//             return Some(start);
	//         }
	//         None
	//     }
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