import { TestGenProvider } from "../_base/test/TestGenProvider";
import { CodeFile, CodeStructure } from "../../editor/codemodel/CodeFile";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { TestGenContext } from "../_base/test/TestGenContext";
import { injectable } from "inversify";
import vscode from "vscode";
import path from "path";
import fs from "fs";

@injectable()
export class TypeScriptTestGenProvider implements TestGenProvider {
	private context: TestGenContext | undefined;
	private languageService: TSLanguageService | undefined;

	constructor() {

	}

	async setup(defaultLanguageService: TSLanguageService, context?: TestGenContext) {
		this.languageService = defaultLanguageService;
		this.context = context;
	}

	findOrCreateTestFile(sourceFile: CodeFile, element: any): Promise<TestGenContext> {
		return Promise.resolve(this.context!!);
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
		const project = vscode.workspace.getWorkspaceFolder(element.uri);
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
		let nameCandidate = `${prefix}.test.${extension}`;
		let testFilePath = path.join(testPath, nameCandidate);

		let i = 1;
		while (fs.existsSync(testFilePath)) {
			nameCandidate = `${prefix}${i}.test.${extension}`;
			testFilePath = path.join(testPath, nameCandidate);
			i++;
		}

		return vscode.Uri.file(testFilePath);
	}
}