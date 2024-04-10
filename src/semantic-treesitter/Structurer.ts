import Parser, { Query } from "web-tree-sitter";
import { SupportedLanguage } from "../language/supported";
import { TSLanguage } from "./TreeSitterLanguage";
import { CodeFile, CodeFunction } from "../model/program";

export abstract class Structurer {
	protected parser: Parser | undefined;
	protected language: Parser.Language | undefined;
	protected abstract langId: SupportedLanguage;

	async init(): Promise<Query | undefined> {
		const tsConfig = TSLanguage.fromId(this.langId)!!;
		const parser = new Parser();
		const language = await tsConfig.grammar();
		parser.setLanguage(language);
		this.parser = parser
		this.language = language
		return language?.query(tsConfig.structureQuery.scopeQuery)
	}

	async parseFile(code: string): Promise<CodeFile | undefined> {
		return undefined;
	}

	protected insertLocation(model: any, node: Parser.SyntaxNode) {
		model.set_start(node.startPosition.row, node.startPosition.column);
		model.set_end(node.endPosition.row, node.endPosition.column);
	}

	protected createFunction(capture: Parser.QueryCapture, text: string): CodeFunction {
		const functionObj: CodeFunction = {
			vars: [],
			name: text,
			start: { row: 0, column: 0 },
			end: { row: 0, column: 0 }
		}

		// @ts-ignore
		const node = capture.node.parent()!!;
		functionObj.start = { row: node.startPosition.row, column: node.startPosition.column };
		functionObj.end = { row: node.endPosition.row, column: node.endPosition.column };
		return functionObj;
	}
}