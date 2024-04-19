import fs from "fs";
import path from "path";
import vscode, { Uri } from "vscode";
import { injectable } from "inversify";

import { TestGenProvider } from "../_base/test/TestGenProvider";
import { CodeFile, CodeStructure } from "../../editor/codemodel/CodeFile";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { TestGenContext } from "../_base/test/TestGenContext";
import { NamedElementBlock } from "../../editor/document/NamedElementBlock";


@injectable()
export class TypeScriptTestGenProvider implements TestGenProvider {
	private context: TestGenContext | undefined;
	private languageService: TSLanguageService | undefined;

	isApplicable(lang: string): boolean {
		return lang === "typescript" || lang === "javascript" || lang === "javascriptreact" || lang === "typescriptreact";
	}

	constructor() {}

	async setup(defaultLanguageService: TSLanguageService, context?: TestGenContext) {
		this.languageService = defaultLanguageService;
		this.context = context;
	}

	async findOrCreateTestFile(sourceFile: vscode.TextDocument, block: NamedElementBlock): Promise<TestGenContext> {
		const language = sourceFile.languageId;
		const testFilePath: vscode.Uri | undefined = this.getTestFilePath(sourceFile);
		if (!testFilePath) {
			return Promise.reject(`Failed to find test file path for: ${sourceFile}`);
		}

		const elementName = block.identifierRange.text;

		if (fs.existsSync(testFilePath.toString())) {
			const context: TestGenContext = {
				currentObject: undefined,
				language: "",
				relatedClasses: [],
				testClassName: ""
			};

			return context;
		}

		// Create test file with vscode.workspace.fs.writeFile
		await vscode.workspace.fs.writeFile(testFilePath, new Uint8Array());

		// const underTestObj = ReadAction.compute<string, Throwable>(() => {
		// 	const underTestObj = new JavaScriptClassContextBuilder().getClassContext(elementToTest, false)?.format();
		//
		// 	if (!underTestObj) {
		// 		const funcObj = new JavaScriptMethodContextBuilder().getMethodContext(elementToTest, false, false)?.format();
		// 		return funcObj ?? '';
		// 	} else {
		// 		return underTestObj;
		// 	}
		// });

		// const imports: string[] = (sourceFile as any)?.getImportStatements()?.map((importStatement: any) => {
		// 	return importStatement.text;
		// }) ?? [];

		// return new TestFileContext(true, testFile, [], elementName, language, underTestObj, imports);
		const context: TestGenContext = {
			currentObject: undefined,
			isNewFile: true,
			language: language,
			relatedClasses: [],
			testClassName: elementName
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