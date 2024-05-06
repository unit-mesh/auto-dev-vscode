import { SyntaxNode } from "web-tree-sitter";

import { CodeFile, CodeFunction, CodeVariable } from "../../editor/codemodel/CodeFile";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { PositionElement } from "../../editor/codemodel/PositionElement";

export interface StructurerProvider {
	isApplicable(lang: SupportedLanguage): any;
	parseFile(code: string, path: string): Promise<CodeFile | undefined>
}

export function insertLocation(node: SyntaxNode, model: PositionElement) {
	model.start = { row: node.startPosition.row, column: node.startPosition.column };
	model.end = { row: node.endPosition.row, column: node.endPosition.column };
}

export function createFunction(syntaxNode: SyntaxNode, text: string): CodeFunction {
	const functionObj: CodeFunction = {
		vars: [],
		name: text,
		start: { row: 0, column: 0 },
		end: { row: 0, column: 0 }
	};

	const node = syntaxNode.parent ?? syntaxNode;
	functionObj.start = { row: node.startPosition.row, column: node.startPosition.column };
	functionObj.end = { row: node.endPosition.row, column: node.endPosition.column };
	return functionObj;
}

export function createVariable(node: SyntaxNode, text: string, typ: string): CodeVariable {
	const variable: CodeVariable = {
		name: text,
		start: { row: 0, column: 0 },
		end: { row: 0, column: 0 },
		type: ""
	};

	variable.start = { row: node.startPosition.row, column: node.startPosition.column };
	variable.end = { row: node.endPosition.row, column: node.endPosition.column };
	return variable;
}