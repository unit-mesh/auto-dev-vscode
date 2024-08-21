import { injectable } from 'inversify';
import Parser, { SyntaxNode } from 'web-tree-sitter';


import { TextRange } from '../../code-search/scope-graph/model/TextRange';
import { ScopeGraph } from '../../code-search/scope-graph/ScopeGraph';
import { CodeFile, CodeFunction, CodeStructure, CodeVariable, StructureType } from '../../editor/codemodel/CodeElement';
import { LanguageProfile, LanguageProfileUtil } from '../_base/LanguageProfile';
import { BaseStructurerProvider } from '../_base/StructurerProvider';
import { LanguageIdentifier } from 'base/common/languages/languages';

@injectable()
export class CsharpStructurerProvider extends BaseStructurerProvider {
	protected langId: LanguageIdentifier = 'csharp';
	protected config: LanguageProfile = LanguageProfileUtil.from(this.langId)!!;
	protected parser: Parser | undefined;
	protected language: Parser.Language | undefined;

	constructor() {
		super();
	}

	isApplicable(lang: string) {
		return lang === this.langId;
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

	/**
	 * `parseFile`方法是一个异步函数，它解析给定的代码字符串并生成CodeFile对象。此对象表示代码的结构。
	 *
	 * @param code 表示要解析的代码的字符串。
	 * @param filepath 表示文件路径的字符串。
	 * @returns 解析为CodeFile对象的Promise。此对象包含有关解析代码结构的信息，包括名称、文件路径、语言、函数、路径、包、导入和类。如果解析失败，Promise将解析为undefined。
   *
   * 该方法使用解析器来解析代码，并使用查询来捕获代码的结构。然后，它迭代这些捕获，以提取有关包、导入、类、方法和代码其他元素的信息。此信息用于填充CodeFile对象。
   *
   * 该方法还处理嵌套的类和方法，确保每个类和方法与其父类或方法正确关联。
   *
   * 注意：此方法假定代码字符串是用解析器可以解析的语言编写的。如果解析器无法解析代码，则该方法可能会失败或返回不正确的结果。
   *
	 */
	async parseFile(code: string, filepath: string): Promise<CodeFile | undefined> {
		const tree = this.parser!!.parse(code);
		const query = this.config.structureQuery.query(this.language!!);
		const captures = query!!.captures(tree.rootNode);

		let filename = filepath.split('/')[filepath.split('/').length - 1];
		const codeFile: CodeFile = {
			name: filename,
			filepath: filepath,
			language: this.langId,
			functions: [],
			path: '',
			package: '',
			imports: [],
			classes: [],
		};
		let classObj: CodeStructure = {
			type: StructureType.Class,
			canonicalName: '',
			constant: [],
			extends: [],
			methods: [],
			name: '',
			package: '',
			implements: [],
			start: { row: 0, column: 0 },
			end: { row: 0, column: 0 },
		};
		let isLastNode = false;
		const methods: CodeFunction[] = [];
		let methodReturnType = '';
		let methodName = '';

		const fields: CodeVariable[] = [];
		let lastField: CodeVariable = this.initVariable();

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
							type: StructureType.Class,
							canonicalName: '',
							package: codeFile.package,
							implements: [],
							constant: [],
							extends: [],
							methods: [],
							name: '',
							start: { row: 0, column: 0 },
							end: { row: 0, column: 0 },
						};
					}

					classObj.name = text;
					classObj.canonicalName = codeFile.package + '.' + classObj.name;
					const classNode: Parser.SyntaxNode | null = capture.node?.parent ?? null;
					if (classNode !== null) {
						this.insertLocation(classNode, classObj);
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
						const methodObj = this.createFunction(capture.node, methodName);
						if (methodReturnType !== '') {
							methodObj.returnType = methodReturnType;
						}
						if (methodNode !== null) {
							this.insertLocation(methodNode, classObj);
						}

						methods.push(methodObj);
					}

					methodReturnType = '';
					methodName = '';
					break;
				case 'field-type':
					lastField.type = text;
					break;
				case 'field-decl':
					lastField.name = text;
					fields.push({ ...lastField });
					lastField = this.initVariable();
					break;
				case 'impl-name':
					classObj.implements.push(text);
					break;
				default:
					break;
			}
		}

		classObj.fields = fields;
		classObj.methods = methods;

		if (isLastNode && classObj.name !== '') {
			codeFile.classes.push({ ...classObj });
		}

		return this.combineSimilarClasses(codeFile);
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

/**
*`extractMethodIOImports`是一个异步方法，用于提取与输入和输出相关的导入语句
*源代码中给定方法的类型。
*
* @param ｛ScopeGraph｝ graph -源代码的节点图。
* @param {SyntaxNode} 节点 -表示源代码中方法的语法节点。
* @param ｛TextRange｝ range -源代码中方法的范围。
* @param {string} src-源代码为字符串。
*
* @returns {Promise<string[] | undefined>} 一个promise，解析为一个import语句数组，如果找不到import语句，则解析为undefined。
*
* 该方法的工作原理是首先在源代码中找到与给定范围对应的语法节点。然后，它使用查询来捕获方法的返回类型和参数类型。对于每个捕获的元素，它从源代码中获取相应的导入语句并将其添加到数组中。最后，在返回数组之前，它会从数组中删除任何重复的导入语句。
*
* 该方法使用“fetchImportsWithinScope”方法从源代码中获取给定语法节点的导入语句。
*
* 注意：该方法假定定义了`config`对象的`methodIOQuery`和`language`属性。
*/

	async retrieveMethodIOImports(
		graph: ScopeGraph,
		node: SyntaxNode,
		range: TextRange,
		src: string,
	): Promise<string[] | undefined> {
		let syntaxNode = node.namedDescendantForPosition(
			{ row: range.start.line, column: range.start.column },
			{ row: range.end.line, column: range.end.column },
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

	async extractFields(node: SyntaxNode) {
		const query = this.config.fieldQuery!!.query(this.language!!);
		const captures = query!!.captures(node);

		const fields: CodeVariable[] = [];
		let fieldObj: CodeVariable = this.initVariable();

		for (const element of captures) {
			const capture: Parser.QueryCapture = element!!;
			const text = capture.node.text;

			switch (capture.name) {
				case 'field-name':
					fieldObj.name = text;
					fields.push({ ...fieldObj });
					fieldObj = this.initVariable();
					break;
				case 'field-type':
					fieldObj.type = text;
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
