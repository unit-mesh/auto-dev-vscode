import Parser from "web-tree-sitter";
import { Structurer } from "../Structurer";
import { JavaTSConfig } from "./JavaTSConfig";
import { SupportedLanguage } from "../../language/SupportedLanguage.ts";
import { CodeFile, CodeFunction, CodeStructure } from "../../codemodel/CodeFile.ts";

export class JavaStructurer extends Structurer {
	protected langId: SupportedLanguage = "java";

	/**
	 * Parses the given code string and generates a CodeFile object representing the structure of the code.
	 *
	 * @param code The code string to be parsed.
	 * @returns A Promise that resolves to the generated CodeFile object, or undefined if the parsing fails.
	 */
	override async parseFile(code: string): Promise<CodeFile | undefined> {
		const tree = this.parser!!.parse(code);
		let query = this.language!!.query(JavaTSConfig.structureQuery.scopeQuery)!!;
		const captures = query!!.captures(tree.rootNode);

		const codeFile: CodeFile = {
			fileName: "",
			language: this.langId,
			functions: [],
			path: "",
			package: '',
			imports: [],
			classes: []
		};
		let classObj: CodeStructure = {
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
							package: codeFile.package, implements: [],
							constant: [], extends: [], methods: [], name: '',
							start: { row: 0, column: 0 },
							end: { row: 0, column: 0 }
						};
					}
					classObj.name = text;
					const classNode: Parser.SyntaxNode | null = capture.node?.parent ?? null;
					if (classNode !== null) {
						this.insertLocation(classObj, classNode);
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
						const methodObj = this.createFunction(capture, methodName);
						if (methodReturnType !== '') {
							methodObj.returnType = methodReturnType;
						}
						if (methodNode !== null) {
							this.insertLocation(classObj, methodNode);
						}

						methods.push(methodObj);
					}

					methodReturnType = '';
					methodName = '';
					break;
				case 'impl-name':
					classObj.implements.push(text);
					break;
				default:
					// console.log(`pattern: ${capture.node.startIndex}, capture: ${captureName}, row: ${capture.node.startPosition.row}, text: ${text}`);
					break;
			}
		}

		classObj.methods = methods;

		if (isLastNode) {
			codeFile.classes.push({ ...classObj });
		}

		return codeFile;
	}
}
