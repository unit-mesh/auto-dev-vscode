import { Point } from "./model/TextRange";
import { SyntaxNode } from "web-tree-sitter";
import { LocalScope } from "./scope/LocalScope";
import { LocalImport } from "./scope/LocalImport";
import { LocalDef } from "./scope/LocalDef";
import { Reference } from "./scope/Reference";

export class ScopeGraph {
	private startPosition: Point;
	private endPosition: Point;
	private langIndex: number;

	constructor(rootNode: SyntaxNode, langIndex: number) {
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
}