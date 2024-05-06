import { injectable } from "inversify";
import vscode, { TextDocument } from "vscode";
import path from "path";
import fs from "fs";

import { NamedElement } from "../../editor/ast/NamedElement";
import { CodeFile } from "../../editor/codemodel/CodeElement";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { AutoTestTemplateContext } from "../_base/test/AutoTestTemplateContext";
import { TestGenProvider } from "../_base/test/TestGenProvider";
import { ToolchainContextItem } from "../../toolchain-context/ToolchainContextProvider";

@injectable()
export class GoTestGenProvider implements TestGenProvider {
	private languageService: TSLanguageService | undefined;
	context: AutoTestTemplateContext | undefined;

	isApplicable(lang: string): boolean {
		return lang === "go";
	}

	setupLanguage(defaultLanguageService: TSLanguageService, context?: AutoTestTemplateContext | undefined): Promise<void> {
		this.languageService = defaultLanguageService;
		return Promise.resolve();
	}

	async setupTestFile(sourceFile: TextDocument, element: NamedElement): Promise<AutoTestTemplateContext> {
		const testFilePath: vscode.Uri | undefined = this.getTestFilePath(sourceFile);

		if (!testFilePath) {
			return Promise.reject(`Failed to find test file path for: ${sourceFile}`);
		}

		const elementName = element.identifierRange.text;

		if (fs.existsSync(testFilePath.toString())) {
			const context: AutoTestTemplateContext = {
				filename: sourceFile.fileName,
				currentClass: undefined,
				language: "",
				relatedClasses: "",
				underTestClassName: "",
				imports: [],
				targetPath: testFilePath.fsPath
			};

			this.context = context;
			return context;
		}

		await vscode.workspace.fs.writeFile(testFilePath, new Uint8Array());
		const context: AutoTestTemplateContext = {
			filename: sourceFile.fileName,
			currentClass: undefined,
			language: "",
			relatedClasses: "",
			underTestClassName: elementName,
			imports: [],
			targetPath: testFilePath.fsPath
		};

		this.context = context;
		return context;
	}

	getTestFilePath(element: vscode.TextDocument): vscode.Uri | undefined {
		const extension = path.extname(element.uri.fsPath);
		const elementName = path.basename(element.uri.fsPath, extension);

		const testFileName = `${elementName}_test${extension}`;
		const testFilePath = path.join(path.dirname(element.uri.fsPath), testFileName);

		return vscode.Uri.file(testFilePath);
	}

	lookupRelevantClass(element: any): Promise<CodeFile[]> {
		return Promise.resolve([]);
	}

	collect(context: AutoTestTemplateContext): Promise<ToolchainContextItem[]> {
		return Promise.resolve([]);
	}

	async postProcessCodeFix(document: vscode.TextDocument, output: string): Promise<void> {
		return Promise.resolve();
	}
}
