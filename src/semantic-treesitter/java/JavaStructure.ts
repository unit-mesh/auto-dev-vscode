import { TSLanguage } from "../TreeSitterLanguage";
import Parser, { Query } from "web-tree-sitter";
import { SupportedLanguage } from "../../language/supported";

export interface CodePoint {
	row: number;
	column: number;
}

interface CodeFile {
	file_name: string;
	path: string;
	package: string;
	imports: string[];
	classes: CodeStructure[];
	functions: CodeFunction[];
}

export interface CodeStructure {
	name: string;
	package: string;
	extends: string[];
	implements: string[];
	constant: ClassConstant[];
	// in some languages, functions and methods are different names
	methods: CodeFunction[];
	start?: CodePoint;
	end?: CodePoint;
}

export interface CodeFunction {
	name: string;
	vars: string[];
	start: CodePoint;
	end: CodePoint;
}

export interface ClassConstant {
	name: string;
	typ: string;
}

export class Structure {
	protected parser: Parser | undefined;

	async init(langId: SupportedLanguage): Promise<Query | undefined> {
		const tsConfig = TSLanguage.fromId(langId)!!;
		this.parser = new Parser();
		const language = await tsConfig.grammar();
		this.parser.setLanguage(language);
		return language?.query(tsConfig.structureQuery.scopeQuery)
	}

	async parse(code: string, query: Query): Promise<CodeFile | undefined> {
		return undefined;
	}
}

export class JavaStructure extends Structure {
	override async parse(code: string, query: Query): Promise<CodeFile | undefined> {
		const tree = this.parser!!.parse(code);
		const captures = query.captures(tree.rootNode);

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
						// JavaIdent.insertLocation(classObj, classNode);
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
					console.log(`pattern: ${capture.node.startIndex}, capture: ${captureName}, row: ${capture.node.startPosition.row}, text: ${text}`);
					break;
			}
		}

		if (isLastNode) {
			codeFile.classes.push({ ...classObj });
		}

		return codeFile;
	}
}
