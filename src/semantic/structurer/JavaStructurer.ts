import Parser from "web-tree-sitter";

import { Structurer } from "./Structurer";
import { JavaTSConfig } from "../langconfig/JavaTSConfig";
import { SupportedLanguage } from "../../language/SupportedLanguage";
import { CodeFile, CodeFunction, CodeStructure } from "../../codemodel/CodeFile";
import { TSLanguageConfig } from "../langconfig/TSLanguageConfig";

export class JavaStructurer extends Structurer {
	protected langId: SupportedLanguage = "java";
	protected config: TSLanguageConfig = JavaTSConfig;

	/**
	 * Parses the given code string and generates a CodeFile object representing the structurer of the code.
	 *
	 * @param code The code string to be parsed.
	 * @returns A Promise that resolves to the generated CodeFile object, or undefined if the parsing fails.
	 */
	override async parseFile(code: string): Promise<CodeFile | undefined> {
		const tree = this.parser!!.parse(code);
		const query = this.config.structureQuery.query(this.language!!);
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
							package: codeFile.package, implements: [],
							constant: [], extends: [], methods: [], name: '',
							start: { row: 0, column: 0 },
							end: { row: 0, column: 0 }
						};
					}
					classObj.name = text;
					classObj.canonicalName = codeFile.package + "." + classObj.name;
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
