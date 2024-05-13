import { injectable } from "inversify";
import vscode from "vscode";

import { RelevantCodeProvider } from "../_base/RelevantCodeProvider";
import { CodeFile } from "../../editor/codemodel/CodeElement";
import { NamedElement } from "../../editor/ast/NamedElement";
import { JavaStructurerProvider } from "./JavaStructurerProvider";
import { TextRange } from "../../code-search/scope-graph/model/TextRange";
import { JavaRelevantLookup } from "./utils/JavaRelevantLookup";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { TreeSitterFile } from "../ast/TreeSitterFile";
import { ScopeGraph } from "../../code-search/scope-graph/ScopeGraph";

@injectable()
export class JavaRelevantCodeProvider implements RelevantCodeProvider {
	name = "JavaRelatedProvider";
	language = "java";
	languageService: TSLanguageService | undefined;

	async setupLanguage(defaultLanguageService: TSLanguageService) {
		this.languageService = defaultLanguageService;
	}

	async getMethodFanInAndFanOut(file: TreeSitterFile, method: NamedElement): Promise<CodeFile[]> {
		let graph = await file.scopeGraph();
		return await this.lookupRelevantClass(method, file, graph);
	}

	async lookupRelevantClass(element: NamedElement, tsfile: TreeSitterFile, graph: ScopeGraph): Promise<CodeFile[]> {
		let structurer = new JavaStructurerProvider();
		await structurer.init(this.languageService!!);

		const textRange: TextRange = element.blockRange.toTextRange();
		const source = tsfile.sourcecode;
		let ios: string[] = await structurer.retrieveMethodIOImports(graph, tsfile.tree.rootNode, textRange, source) ?? [];

		let lookup = new JavaRelevantLookup(tsfile);
		let paths = lookup.relevantImportToFilePath(ios);

		// read file by path and structurer to parse it to uml
		async function parseCodeFile(path: string): Promise<CodeFile | undefined> {
			const uri = vscode.Uri.file(path);
			if (!await vscode.workspace.fs.stat(uri)) {
				return undefined;
			}

			try {
				const document = await vscode.workspace.openTextDocument(uri);
				return await structurer.parseFile(document.getText(), path);
			} catch (e) {
				console.info(`Failed to open file ${path}`);
				return undefined;
			}
		}

		let codeFiles: CodeFile[] = [];
		for (const path of paths) {
			let codeFile: CodeFile | undefined = undefined;
			try {
				codeFile = await parseCodeFile(path);
			} catch (e) {
				console.info(`Failed to parse file ${path}`);
			}

			if (codeFile !== undefined) {
				codeFiles.push(codeFile);
			}
		}

		return codeFiles;
	}
}
