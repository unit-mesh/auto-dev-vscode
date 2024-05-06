import vscode from "vscode";

import { ActionExecutor } from "../_base/ActionExecutor";
import { NamedElement } from "../../ast/NamedElement";
import { TestGenProviderManager } from "../../../code-context/TestGenProviderManager";
import { PromptManager } from "../../../prompt-manage/PromptManager";
import { ChatMessage, ChatRole } from "../../../llm-provider/ChatMessage";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor-api/AutoDevStatusManager";
import { LlmProvider } from "../../../llm-provider/LlmProvider";
import { MarkdownCodeBlock } from "../../../markdown/MarkdownCodeBlock";
import { CreateToolchainContext } from "../../../toolchain-context/ToolchainContextProvider";
import { ActionType } from "../../../prompt-manage/ActionType";
import { CommentedUmlPresenter } from "../../codemodel/presenter/CommentedUmlPresenter";
import { RelevantCodeProviderManager } from "../../../code-context/RelevantCodeProviderManager";
import { documentToTreeSitterFile } from "../../../code-context/ast/TreeSitterFileUtil";
import { DefaultLanguageService } from "../../language/service/DefaultLanguageService";
import { CodeFile } from "../../codemodel/CodeElement";
import { TreeSitterFile } from "../../../code-context/ast/TreeSitterFile";

export class AutoTestActionExecutor implements ActionExecutor {
	type: ActionType = ActionType.AutoTest;

	private document: vscode.TextDocument;
	private namedElement: NamedElement;
	private edit: vscode.WorkspaceEdit;
	private language: string;

	constructor(document: vscode.TextDocument, range: NamedElement, edit: vscode.WorkspaceEdit) {
		this.document = document;
		this.namedElement = range;
		this.edit = edit;
		this.language = document.languageId;
	}

	async execute(): Promise<void> {
		let testGen = TestGenProviderManager.getInstance();
		let testgen = await testGen.provide(this.language);

		if (testgen?.isApplicable(this.language) !== true) {
			return;
		}

		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.InProgress);

		const testContext = await testgen.setupTestFile(this.document, this.namedElement);

		let file = await documentToTreeSitterFile(this.document);
		testContext.relatedClasses = await this.relatedClassesContext(file);

		const startTime = new Date().getTime();
		console.log("startTime: ", startTime);

		const creationContext: CreateToolchainContext = {
			action: "AutoTestAction",
			filename: this.document.fileName,
			language: this.language,
			content: this.document.getText(),
			element: this.namedElement,
		};

		// TODO: spike better way to improve performance
		let toolchainContextItems = await PromptManager.getInstance().collectToolchain(creationContext);
		let languageContextItems = await testgen.collect(testContext);

		const toolchainItems = toolchainContextItems.concat(languageContextItems);
		if (toolchainItems.length > 0) {
			testContext.chatContext = toolchainItems.map(item => item.text).join("\n - ");
			console.info(`chat context: ${testContext.chatContext}`);
		}

		// end time
		const endTime = new Date().getTime();
		console.log("endTime: ", startTime);
		console.info(`Time taken to collect context: ${endTime - startTime}ms`);

		let content = await PromptManager.getInstance().templateToPrompt(ActionType.AutoTest, testContext);
		console.info(`user prompt: ${content}`);

		let msg: ChatMessage = {
			role: ChatRole.User,
			content: content
		};

		let llm = LlmProvider.instance();
		let doc: string = "";

		try {
			for await (const chunk of llm._streamChat([msg])) {
				doc += chunk.content;
			}
		} catch (e) {
			console.error(e);
			AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.Error);
			return;
		}

		console.info(`result: ${doc}`);

		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.Done);
		const output = MarkdownCodeBlock.parse(doc).text;

		console.info(`FencedCodeBlock parsed output: ${output}`);

		// write to output file
		const outputFile = testContext.targetPath;
		await vscode.workspace.fs.writeFile(vscode.Uri.file(outputFile!!), Buffer.from(output));
	}

	private async relatedClassesContext(file: TreeSitterFile) {
		let relatedProvider = RelevantCodeProviderManager.getInstance().provider(this.language, new DefaultLanguageService());
		let relatedFiles: CodeFile[] = [];
		if (relatedProvider) {
			relatedFiles = await relatedProvider.getMethodFanInAndFanOut(file, this.namedElement);
		}

		let umlPresenter = new CommentedUmlPresenter();
		return relatedFiles.map((codeStructure) => {
			return umlPresenter.present(codeStructure);
		}).join("\n");
	}
}