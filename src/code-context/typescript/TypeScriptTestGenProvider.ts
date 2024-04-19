import fs from "fs";
import path from "path";
import vscode from "vscode";
import { injectable } from "inversify";

import { TestGenProvider } from "../_base/test/TestGenProvider";
import { CodeStructure } from "../../editor/codemodel/CodeFile";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { TestGenContext } from "../_base/test/TestGenContext";
import { NamedElementBlock } from "../../editor/document/NamedElementBlock";
import { documentToTreeSitterFile } from "../ast/TreeSitterFileUtil";


@injectable()
export class TypeScriptTestGenProvider implements TestGenProvider {
	private languageService: TSLanguageService | undefined;

	isApplicable(lang: string): boolean {
		return lang === "typescript" || lang === "javascript" || lang === "javascriptreact" || lang === "typescriptreact";
	}

	constructor() {
	}

	async setup(defaultLanguageService: TSLanguageService) {
		this.languageService = defaultLanguageService;
	}

	async findOrCreateTestFile(sourceFile: vscode.TextDocument, block: NamedElementBlock): Promise<TestGenContext> {
		const language = sourceFile.languageId;
		const testFilePath: vscode.Uri | undefined = this.getTestFilePath(sourceFile);
		if (!testFilePath) {
			return Promise.reject(`Failed to find test file path for: ${sourceFile}`);
		}

		const elementName = block.identifierRange.text;

		let tsFile = await documentToTreeSitterFile(sourceFile);
		if (!tsFile) {
			return Promise.reject(`Failed to find tree-sitter file for: ${sourceFile.uri}`);
		}

		let scopeGraph = await tsFile.scopeGraph();

		let imports: string[] = [];
		let nodeByRange = scopeGraph.nodeByRange(block.blockRange.startIndex, block.blockRange.endIndex);
		if (nodeByRange) {
			imports = scopeGraph.imports(nodeByRange);
		}

		if (fs.existsSync(testFilePath.toString())) {
			const context: TestGenContext = {
				currentObject: undefined,
				language: "",
				relatedClasses: [],
				testClassName: "",
				imports: imports
			};

			return context;
		}

		await vscode.workspace.fs.writeFile(testFilePath, new Uint8Array());

		const context: TestGenContext = {
			currentObject: undefined,
			isNewFile: true,
			language: language,
			relatedClasses: [],
			testClassName: elementName,
			imports: imports
		};

		return context;
	}

	lookupRelevantClass(element: any): Promise<CodeStructure> {
		throw new Error("Method not implemented.");
	}

	getTestFilePath(element: vscode.TextDocument): vscode.Uri | undefined {
		const testDirectory = this.suggestTestDirectory(element);
		if (!testDirectory) {
			console.warn(`Failed to find test directory for: ${element.uri}`);
			return undefined;
		}

		const extension = path.extname(element.uri.fsPath);
		const elementName = path.basename(element.uri.fsPath, extension);
		return this.generateUniqueTestFile(elementName, element, testDirectory, extension);
	}

	suggestTestDirectory(element: vscode.TextDocument): vscode.Uri | undefined {
		const project = vscode.workspace.workspaceFolders?.[0];
		if (!project) {
			return undefined;
		}

		const parentDir = path.dirname(element.uri.fsPath);
		const testDir = path.join(parentDir, 'test');
		if (!fs.existsSync(testDir)) {
			fs.mkdirSync(testDir);
		}

		return vscode.Uri.file(testDir);
	}

	generateUniqueTestFile(
		elementName: string,
		containingFile: vscode.TextDocument,
		testDirectory: vscode.Uri,
		extension: string
	): vscode.Uri {
		const testPath = testDirectory.fsPath;
		const prefix = elementName || path.basename(containingFile.uri.fsPath, extension);
		let nameCandidate = `${prefix}.test${extension}`;
		let testFilePath = path.join(testPath, nameCandidate);

		let i = 1;
		while (fs.existsSync(testFilePath)) {
			nameCandidate = `${prefix}${i}.test${extension}`;
			testFilePath = path.join(testPath, nameCandidate);
			i++;
		}

		return vscode.Uri.file(testFilePath);
	}
}