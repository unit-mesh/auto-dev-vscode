import Parser, { Query } from "web-tree-sitter";
import { SupportedLanguage } from "../language/SupportedLanguage";
import { TSLanguage } from "./TreeSitterLanguage";
import { CodeFile, CodeFunction, CodeStructure } from "../codemodel/CodeFile";

export abstract class Structurer {
	protected parser: Parser | undefined;
	protected language: Parser.Language | undefined;
	protected abstract langId: SupportedLanguage;

	async init(parser?: Parser): Promise<Query | undefined> {
		const tsConfig = TSLanguage.fromId(this.langId)!!;
		const _parser = parser ?? new Parser();
		const language = await tsConfig.grammar();
		_parser.setLanguage(language);
		this.parser = _parser;
		this.language = language;
		return language?.query(tsConfig.structureQuery.scopeQuery);
	}

	async parseFile(code: string): Promise<CodeFile | undefined> {
		return undefined;
	}

	protected insertLocation(model: CodeStructure, node: Parser.SyntaxNode) {
		model.start = { row: node.startPosition.row, column: node.startPosition.column };
		model.end = { row: node.endPosition.row, column: node.endPosition.column };
	}

	protected createFunction(capture: Parser.QueryCapture, text: string): CodeFunction {
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
}
