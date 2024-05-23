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
export class PythonTestGenProvider implements TestGenProvider {
	private languageService: TSLanguageService | undefined;
	private context: AutoTestTemplateContext | undefined;

	private clazzName = this.constructor.name;

	isApplicable(lang: string): boolean {
		return lang === "python";
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
		const testFilePath: vscode.Uri | undefined = await this.findOrCreateTestFile(sourceFile.uri);
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

	async findOrCreateTestFile(sourceUri: vscode.Uri): Promise<undefined | vscode.Uri> {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			return undefined;
		}

		const testFileName = this.getTestNameExample(sourceUri.fsPath);
		const testDir = this.getTestsDirectory(sourceUri.fsPath, workspaceFolder.uri.fsPath);
		const testFilePath = path.join(testDir, this.toTestFileName(testFileName, path.basename(sourceUri.fsPath)));

		await vscode.workspace.fs.createDirectory(vscode.Uri.file(testDir));
		await vscode.workspace.fs.writeFile(vscode.Uri.file(testFilePath), Buffer.from(''));

		return vscode.Uri.file(testFilePath);
	}

	getTestNameExample(filePath: string) {
		const dirPath = path.dirname(filePath);
		const children = fs.readdirSync(dirPath);
		for (const child of children) {
			const childPath = path.join(dirPath, child);
			if (child.endsWith('.py') && !child.startsWith('_')) {
				return child;
			}
		}
		return 'test_example.py';
	}

	getTestsDirectory(filePath: string, workspacePath: string) {
		const testDir = path.join(workspacePath, 'tests');
		if (!fs.existsSync(testDir)) {
			fs.mkdirSync(testDir, { recursive: true });
		}
		return testDir;
	}

	toTestFileName(testFileName: string, exampleName: string) {
		if (exampleName.startsWith('test_')) {
			return `test_${testFileName}.py`;
		}
		return `${testFileName}_test.py`;
	}

	async postProcessCodeFix(document: vscode.TextDocument, output: string): Promise<void> {
		return Promise.resolve();
	}
}