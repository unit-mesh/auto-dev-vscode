import { Point, TextRange } from "./model/TextRange";
import { SyntaxNode } from "web-tree-sitter";
import { LocalScope } from "./scope/LocalScope";
import { LocalImport } from "./scope/LocalImport";
import { LocalDef } from "./scope/LocalDef";
import { Reference } from "./scope/Reference";
import Graph from "graphology";

// Describes the relation between two nodes in the ScopeGraph
export enum EdgeKind {
	// The edge weight from a nested scope to its parent scope
	ScopeToScope = 'ScopeToScope',

	// The edge weight from a definition to its definition scope
	DefToScope = 'DefToScope',

	// The edge weight from an import to its definition scope
	ImportToScope = 'ImportToScope',

	// The edge weight from a reference to its definition
	RefToDef = 'RefToDef',

	// The edge weight from a reference to its import
	RefToImport = 'RefToImport',
}


type NodeIndex = number;

export class ScopeGraph {
	private startPosition: Point;
	private endPosition: Point;
	private langIndex: number;
	private graph: Graph;

	constructor(rootNode: SyntaxNode, langIndex: number) {
		this.graph = new Graph();
		// let root_idx = graph.add_node(NodeKind::scope(range));
		// this.graph.addNode(LocalScope());
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

	}

	insertLocalImport(import_: LocalImport) {

	}

	insertHoistedDef(localDef: LocalDef) {

	}

	insertGlobalDef(localDef: LocalDef) {

	}

	insertLocalDef(localDef: LocalDef) {

	}

	insertRef(ref_: Reference, sourceCode: string) {

	}

	private scopeByRange(range: TextRange, start: NodeIndex): NodeIndex | null {
		return null;
	}
}