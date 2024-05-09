import { injectable } from "inversify";
import Parser, { Language } from "web-tree-sitter";

import { CodeFile, CodeStructure, CodeVariable, StructureType } from "../../editor/codemodel/CodeElement";
import { BaseStructurerProvider } from "../_base/StructurerProvider";
import { LanguageProfileUtil } from "../_base/LanguageProfile";
import { TypeScriptProfile } from "./TypeScriptProfile";

@injectable()
export class TypeScriptStructurer extends BaseStructurerProvider {
	protected langId: string = "typescript";
	protected config: TypeScriptProfile = LanguageProfileUtil.from(this.langId)!!;
	protected parser: import("web-tree-sitter") | undefined;
	protected language: Language | undefined;

	isApplicable(lang: string) {
		return lang === "typescript" || lang === "javascript" || lang === "typescriptreact" || lang === "javascriptreact";
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
			end: { row: 0, column: 0 }
		};

		for (const element of captures) {
			const capture: Parser.QueryCapture = element!!;
			const text = capture.node.text;

			switch (capture.name) {
				case "import-source":
					codeFile.imports.push(text);
					break;
				case "class-name":
					classObj.name = text;
					classObj.type = StructureType.Class;
					const classNode: Parser.SyntaxNode | null = capture.node?.parent ?? null;
					if (classNode) {
						classObj.start = { row: classNode.startPosition.row, column: classNode.startPosition.column };
						classObj.end = { row: classNode.endPosition.row, column: classNode.endPosition.column };

						codeFile.classes.push(classObj);
					}
					break;
				case "class-method-name":
					classObj.methods.push(this.createFunction(capture.node, text));
					break;
				case "interface-name":
					classObj.name = text;
					classObj.type = StructureType.Interface;
					const interfaceNode: Parser.SyntaxNode | null = capture.node?.parent ?? null;
					if (interfaceNode) {
						classObj.start = { row: interfaceNode.startPosition.row, column: interfaceNode.startPosition.column };
						classObj.end = { row: interfaceNode.endPosition.row, column: interfaceNode.endPosition.column };

						codeFile.classes.push(classObj);
					}
					break;
				case "interface-prop-name":
					let lastClass = codeFile.classes[codeFile.classes.length - 1];
					lastClass.fields = lastClass.fields ?? [];
					lastClass.fields.push(this.createVariable(capture.node, text, ""));
					break;
				case "interface-prop-type":
					let lastClass_ = codeFile.classes[codeFile.classes.length - 1];
					const lastField = lastClass_.fields!![lastClass_.fields!!.length - 1];
					lastField.type = text;
					break;
				default:
					break;
			}
		}

		return Promise.resolve(codeFile);
	}
}
