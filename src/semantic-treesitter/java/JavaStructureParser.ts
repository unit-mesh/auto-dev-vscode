import Parser from "web-tree-sitter";
import { CodeFile, CodeStructure } from "../../model/program";
import { StructureParser } from "../StructureParser";
import { JavaTSConfig } from "./JavaTSConfig";
import { SupportedLanguage } from "../../language/supported";

export class JavaStructureParser extends StructureParser {
	protected langId: SupportedLanguage = "java"

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
			file_name: "", functions: [], path: "",
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
			implements: []
		};
		let isLastNode = false;

		for (let i = 0; i < captures.length; i++) {
			const capture: Parser.QueryCapture = captures[i];
			const captureName = query.captureNames[i];

			const text = capture.node.text;
			switch (captureName) {
				case 'package-name':
					codeFile.package = text;
					break;
				case 'import-name':
					codeFile.imports.push(text);
					break;
				case 'class-name':
					if (classObj.name !== '') {
						codeFile.classes.push({ ...classObj });
						classObj = { constant: [], extends: [], methods: [], name: '', package: codeFile.package, implements: [] };
					}
					classObj.name = text;
					// @ts-ignore
					const classNode = capture.node.parent();
					if (classNode == null) {
						this.insertLocation(classObj, classNode);
						if (!isLastNode) {
							isLastNode = true;
						}
					}
					break;
				case 'impl-name':
					classObj.implements.push(text);
					break;
				case 'parameter':
					break;
				default:
					// console.log(`pattern: ${capture.node.startIndex}, capture: ${captureName}, row: ${capture.node.startPosition.row}, text: ${text}`);
					break;
			}
		}

		if (isLastNode) {
			codeFile.classes.push({ ...classObj });
		}

		return codeFile;
	}
}
