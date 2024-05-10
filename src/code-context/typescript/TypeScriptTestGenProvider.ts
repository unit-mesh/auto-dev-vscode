import fs from "fs";
import path from "path";
import vscode from "vscode";
import { injectable } from "inversify";

import { TestGenProvider } from "../_base/test/TestGenProvider";
import { CodeFile } from "../../editor/codemodel/CodeElement";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { AutoTestTemplateContext } from "../_base/test/AutoTestTemplateContext";
import { NamedElement } from "../../editor/ast/NamedElement";
import { ToolchainContextItem } from "../../toolchain-context/ToolchainContextProvider";
import { TreeSitterFileManager } from "../../editor/cache/TreeSitterFileManager";


@injectable()
export class TypeScriptTestGenProvider implements TestGenProvider {
	private languageService: TSLanguageService | undefined;
	private context: AutoTestTemplateContext | undefined;

	private clazzName = this.constructor.name;

	isApplicable(lang: string): boolean {
		return lang === "typescript" || lang === "javascript" || lang === "javascriptreact" || lang === "typescriptreact";
	}

	constructor() {
	}

	async setupLanguage(defaultLanguageService: TSLanguageService) {
		this.languageService = defaultLanguageService;
	}

	additionalTestContext(context: AutoTestTemplateContext): Promise<ToolchainContextItem[]> {
		return Promise.resolve([]);
	}

	async setupTestFile(sourceFile: vscode.TextDocument, block: NamedElement): Promise<AutoTestTemplateContext> {
		const language = sourceFile.languageId;
		const testFilePath: vscode.Uri | undefined = this.getTestFilePath(sourceFile);
		if (!testFilePath) {
			return Promise.reject(`Failed to find test file path for: ${sourceFile}`);
		}

		const elementName = block.identifierRange.text;

		let tsFile = await TreeSitterFileManager.create(sourceFile);
		if (!tsFile) {
			return Promise.reject(`Failed to find tree-sitter file for: ${sourceFile.uri}`);
		}

		let scopeGraph = await tsFile.scopeGraph();

		let imports: string[] = [];
		let nodeByRange = scopeGraph.nodeByRange(block.blockRange.startIndex, block.blockRange.endIndex);
		if (nodeByRange) {
			imports = scopeGraph.allImportsBySource(sourceFile.getText());
		}

		if (fs.existsSync(testFilePath.toString())) {
			const context: AutoTestTemplateContext = {
				filename: sourceFile.fileName,
				currentClass: undefined,
				language: language,
				relatedClasses: "",
				underTestClassName: "",
				imports: imports,
				targetPath: testFilePath.fsPath
			};

			this.context = context;
			return context;
		}

		await vscode.workspace.fs.writeFile(testFilePath, new Uint8Array());

		const context: AutoTestTemplateContext = {
			filename: sourceFile.fileName,
			currentClass: undefined,
			isNewFile: true,
			language: language,
			sourceCode: block.blockRange.text,
			relatedClasses: "",
			underTestClassName: elementName,
			imports: imports,
			targetPath: testFilePath.fsPath
		};

		return context;
	}

	lookupRelevantClass(element: NamedElement): Promise<CodeFile[]> {
		return Promise.resolve([]);
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

	async postProcessCodeFix(document: vscode.TextDocument, output: string): Promise<void> {
		return Promise.resolve();
	}
}