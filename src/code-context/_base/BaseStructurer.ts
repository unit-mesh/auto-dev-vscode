import Parser from "web-tree-sitter";
import { CodeFile, CodeFunction, CodeStructure } from "../../editor/codemodel/CodeFile";

export interface Structurer {
	parseFile(code: string, path: string): Promise<CodeFile | undefined>
}

export function insertLocation(model: CodeStructure, node: Parser.SyntaxNode) {
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
