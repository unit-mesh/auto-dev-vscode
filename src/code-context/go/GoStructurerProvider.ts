import Parser, { Query, SyntaxNode } from "web-tree-sitter";

import { BaseStructurerProvider } from "../_base/BaseStructurerProvider";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { LanguageConfig } from "../_base/LanguageConfig";
import { CodeFile } from "../../editor/codemodel/CodeElement";
import { ScopeGraph } from "../../code-search/scope-graph/ScopeGraph";
import { TextRange } from "../../code-search/scope-graph/model/TextRange";
import { GoLangConfig } from "./GoLangConfig";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { TSLanguageUtil } from "../ast/TSLanguageUtil";

export class GoStructurerProvider extends BaseStructurerProvider {
	protected langId: SupportedLanguage = "go";
	protected config: LanguageConfig = GoLangConfig;
	protected parser: Parser | undefined;
	protected language: Parser.Language | undefined;

	constructor() {
		super();
	}

	async init(langService: TSLanguageService): Promise<Query | undefined> {
		const tsConfig = TSLanguageUtil.fromId(this.langId)!!;
		const _parser = langService.getParser() ?? new Parser();
		const language = await tsConfig.grammar(langService, this.langId);
		_parser.setLanguage(language);
		this.parser = _parser;
		this.language = language;
		return language?.query(tsConfig.structureQuery.queryStr);
	}

	isApplicable(lang: string) {
		return lang === this.langId;
	}

	parseFile(code: string, filepath: string): Promise<CodeFile | undefined> {
		const tree = this.parser!!.parse(code);
		const query = this.config.structureQuery.query(this.language!!);
		const captures = query!!.captures(tree.rootNode);

		let filename = filepath.split('/')[filepath.split('/').length - 1];
		const codeFile: CodeFile = {
			name: filename,
			filepath: filepath,
			language: this.langId,
			functions: [],
			path: "",
			package: '',
			imports: [],
			classes: []
		};

		// method-name, method-body and function-name, function-body
		for (const element of captures) {
			const capture: Parser.QueryCapture = element!!;

			switch (capture.name) {
				case 'function-name':
					const functionObj = this.createFunction(capture.node, capture.node.text);
					codeFile.functions!!.push(functionObj);
					break;
				case 'function-body':
					break;
				case 'method-name':
					const methodObj = this.createFunction(capture.node, capture.node.text);
					codeFile.classes[0].methods.push(methodObj);
					break;
				case 'method-body':
					break;
			}
		}

		return Promise.resolve(codeFile);
	}

	/**
	 * `extractMethodIOImports` is an asynchronous method that extracts the import statements related to the input and output
	 * types of a given method from the source code.
	 *
	 * @param {ScopeGraph} graph - The node graph of the source code.
	 * @param {SyntaxNode} node - The syntax node representing the method in the source code.
	 * @param {TextRange} range - The range of the method in the source code.
	 * @param {string} src - The source code as a string.
	 *
	 * @returns {Promise<string[] | undefined>} A promise that resolves to an array of import statements or undefined if no import statements are found.
	 *
	 * The method works by first finding the syntax node that corresponds to the given range in the source code. It then uses a query to capture the return type and parameter types of the method. For each captured element, it fetches the corresponding import statements from the source code and adds them to an array. Finally, it removes any duplicate import statements from the array before returning it.
	 *
	 * The method uses the `fetchImportsWithinScope` method to fetch the import statements for a given syntax node from the source code.
	 *
	 * Note: The method assumes that the `methodIOQuery` and `language` properties of the `config` object are defined.
	 */
	async retrieveMethodIOImports(graph: ScopeGraph, node: SyntaxNode, range: TextRange, src: string): Promise<string[] | undefined> {
		let syntaxNode = node.namedDescendantForPosition(
			{ row: range.start.line, column: range.start.column },
			{ row: range.end.line, column: range.end.column }
		);

		const query = this.config.methodIOQuery!!.query(this.language!!);
		const captures = query!!.captures(syntaxNode);

		const inputAndOutput: string[] = [];

		for (const element of captures) {
			const capture: Parser.QueryCapture = element!!;

			switch (capture.name) {
				case 'method-returnType':
					let imports = await this.fetchImportsWithinScope(graph, capture.node, src);
					inputAndOutput.push(...imports);
					break;
				case 'method-param.type':
					let typeImports = await this.fetchImportsWithinScope(graph, capture.node, src);
					inputAndOutput.push(...typeImports);
					break;
				default:
					break;
			}
		}

		// remove duplicates
		return [...new Set(inputAndOutput)];
	}
}