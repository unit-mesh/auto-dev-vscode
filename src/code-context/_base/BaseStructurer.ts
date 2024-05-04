import Parser from "web-tree-sitter";
import { CodeFile, CodeFunction, CodeVariable } from "../../editor/codemodel/CodeFile";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { PositionElement } from "../../editor/codemodel/PositionElement";

export interface Structurer {
	isApplicable(lang: SupportedLanguage): any;
	parseFile(code: string, path: string): Promise<CodeFile | undefined>
}

export function insertLocation(model: PositionElement, node: Parser.SyntaxNode) {
	model.start = { row: node.startPosition.row, column: node.startPosition.column };
	model.end = { row: node.endPosition.row, column: node.endPosition.column };
}

export function createFunction(capture: Parser.QueryCapture, text: string): CodeFunction {
	const functionObj: CodeFunction = {
		vars: [],
		name: text,
		start: { row: 0, column: 0 },
		end: { row: 0, column: 0 }
	};

	const node = capture.node.parent ?? capture.node;
	functionObj.start = { row: node.startPosition.row, column: node.startPosition.column };
	functionObj.end = { row: node.endPosition.row, column: node.endPosition.column };
	return functionObj;
}

export function createVariable(capture: Parser.QueryCapture, text: string): CodeVariable {
	return {
		name: text,
		typ: ''
	};
}