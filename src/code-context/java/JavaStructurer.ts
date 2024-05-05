import Parser, { Query, SyntaxNode } from "web-tree-sitter";
import { injectable } from "inversify";

import { createFunction, insertLocation, Structurer } from "../_base/BaseStructurer";
import { JavaLangConfig } from "./JavaLangConfig";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { CodeFile, CodeFunction, CodeStructure, CodeVariable } from "../../editor/codemodel/CodeFile";
import { LanguageConfig } from "../_base/LanguageConfig";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { TSLanguageUtil } from "../ast/TSLanguageUtil";
import { ScopeGraph } from "../../code-search/scope-graph/ScopeGraph";
import { TextRange } from "../../code-search/scope-graph/model/TextRange";
import { ImportWithRefs } from "../../code-search/scope-graph/model/ImportWithRefs";

@injectable()
export class JavaStructurer implements Structurer {
	protected langId: SupportedLanguage = "java";
	protected config: LanguageConfig = JavaLangConfig;
	protected parser: Parser | undefined;
	protected language: Parser.Language | undefined;

	isApplicable(lang: string) {
		return lang === "java";
	}

	constructor() {
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

	/**
	 * The `parseFile` method is an asynchronous function that parses a given code string and generates a CodeFile object. This object represents the structure of the code.
	 *
	 * @param code - A string representing the code to be parsed.
	 * @param filepath - A string representing the path of the file.
	 *
	 * @returns A Promise that resolves to a CodeFile object. This object contains information about the structure of the parsed code, including the name, filepath, language, functions, path, package, imports, and classes. If the parsing fails, the Promise resolves to undefined.
	 *
	 * The method uses a parser to parse the code and a query to capture the structure of the code. It then iterates over the captures to extract information about the package, imports, classes, methods, and other elements of the code. This information is used to populate the CodeFile object.
	 *
	 * The method also handles nested classes and methods, ensuring that each class and method is correctly associated with its parent class or method.
	 *
	 * Note: This method assumes that the code string is written in a language that the parser can parse. If the parser cannot parse the code, the method may fail or return incorrect results.
	 */
	async parseFile(code: string, filepath: string): Promise<CodeFile | undefined> {
		const tree = this.parser!!.parse(code);
		const query = this.config.structureQuery.query(this.language!!);
		const captures = query!!.captures(tree.rootNode);

		// check include lombok: `import lombok.Data;`;
		let usedLombok = false;
		if (code.includes("import lombok.Data;")) {
			usedLombok = true;
		}

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
		let classObj: CodeStructure = {
			canonicalName: '',
			constant: [],
			extends: [],
			methods: [],
			name: '',
			package: '',
			implements: [],
			start: { row: 0, column: 0 },
			end: { row: 0, column: 0 }
		};
		let isLastNode = false;
		const methods: CodeFunction[] = [];
		let methodReturnType = '';
		let methodName = '';

		const fields: CodeVariable[] = [];
		let lastField: CodeVariable = { name: '', typ: '' };

		for (const element of captures) {
			const capture: Parser.QueryCapture = element!!;
			const text = capture.node.text;

			switch (capture.name) {
				case 'package-name':
					codeFile.package = text;
					break;
				case 'import-name':
					codeFile.imports.push(text);
					break;
				case 'class-name':
					if (classObj.name !== '') {
						codeFile.classes.push({ ...classObj });
						classObj = {
							canonicalName: "",
							package: codeFile.package,
							implements: [],
							constant: [],
							extends: [],
							methods: [],
							name: '',
							start: { row: 0, column: 0 },
							end: { row: 0, column: 0 }
						};
					}

					classObj.name = text;
					classObj.canonicalName = codeFile.package + "." + classObj.name;
					const classNode: Parser.SyntaxNode | null = capture.node?.parent ?? null;
					if (classNode !== null) {
						insertLocation(classObj, classNode);
						if (!isLastNode) {
							isLastNode = true;
						}
					}
					break;
				case 'method-returnType':
					methodReturnType = text;
					break;
				case 'method-name':
					methodName = text;
					break;
				case 'method-body':
					if (methodName !== '') {
						const methodNode = capture.node;
						const methodObj = createFunction(capture, methodName);
						if (methodReturnType !== '') {
							methodObj.returnType = methodReturnType;
						}
						if (methodNode !== null) {
							insertLocation(classObj, methodNode);
						}

						methods.push(methodObj);
					}

					methodReturnType = '';
					methodName = '';
					break;
				case 'field-type':
					lastField.typ = text;
					break;
				case 'field-decl':
					lastField.name = text;
					fields.push({ ...lastField });
					lastField = { name: '', typ: '' };
					break;
				case 'impl-name':
					classObj.implements.push(text);
					break;
				default:
					break;
			}
		}

		if (usedLombok) {
			classObj.fields = fields;
		}

		classObj.methods = methods;

		if (isLastNode && classObj.name !== '') {
			codeFile.classes.push({ ...classObj });
		}

		return codeFile;
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
	async extractMethodIOImports(graph: ScopeGraph, node: SyntaxNode, range: TextRange, src: string): Promise<string[] | undefined> {
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

	async fetchImportsWithinScope(scope: ScopeGraph, node: SyntaxNode, src: string): Promise<string[]> {
		let importWithRefs = this.retrieveImportReferences(scope, src, node);
		return importWithRefs.map((imp) => imp.text);
	}

	/**
	 * The `retrieveImportReferences` method is a private method that retrieves all import references from a given source
	 * code that are within a specified syntax node.
	 *
	 * @param scope - An instance of `ScopeGraph`. This parameter represents the node graph of the source code.
	 * @param src - A string representing the source code from which to retrieve import references.
	 * @param node - An instance of `SyntaxNode`. This parameter represents the syntax node within which to search for import references.
	 *
	 * @returns An array of `ImportWithRefs` objects. Each object in the array represents an import reference that is
	 * within the specified syntax node. If no import references are found within the syntax node, an empty array is returned.
	 */
	private retrieveImportReferences(scope: ScopeGraph, src: string, node: SyntaxNode) {
		let imports: ImportWithRefs[] = scope.allImports(src);
		let range: TextRange = TextRange.from(node);

		return imports.filter((impRange) => {
			let containedRanges = impRange.refs.filter((ref) => {
				return ref.contains(range);
			});

			return containedRanges.length > 0;
		});
	}

	async extractFields(node: SyntaxNode) {
		const query = this.config.fieldQuery!!.query(this.language!!);
		const captures = query!!.captures(node);

		const fields: CodeVariable[] = [];
		let fieldObj: CodeVariable = { name: '', typ: '' };

		for (const element of captures) {
			const capture: Parser.QueryCapture = element!!;
			const text = capture.node.text;

			switch (capture.name) {
				case 'field-name':
					fieldObj.name = text;
					fields.push({ ...fieldObj });
					fieldObj = { name: '', typ: '' };
					break;
				case 'field-type':
					fieldObj.typ = text;
					break;
				case 'field-declaration':
					break;
				default:
					break;
			}
		}

		return fields;
	}
}
