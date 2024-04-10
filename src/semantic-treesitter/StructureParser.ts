import Parser, { Query } from "web-tree-sitter";
import { SupportedLanguage } from "../language/supported";
import { TSLanguage } from "./TreeSitterLanguage";
import { CodeFile, CodeFunction } from "../model/program";

export class StructureParser {
	protected parser: Parser | undefined;
	protected language: Parser.Language | undefined;

	async init(langId: SupportedLanguage): Promise<Query | undefined> {
		const tsConfig = TSLanguage.fromId(langId)!!;
		this.parser = new Parser();
		const language = await tsConfig.grammar();
		this.parser.setLanguage(language);
		return language?.query(tsConfig.structureQuery.scopeQuery)
	}

	protected async parseFile(code: string): Promise<CodeFile | undefined> {
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