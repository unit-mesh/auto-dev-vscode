import vscode from "vscode";

import { ActionExecutor } from "../_base/ActionExecutor";
import { NamedElementBlock } from "../../document/NamedElementBlock";
import { TestGenProviderManager } from "../../../code-context/TestGenProviderManager";
import { PromptManager } from "../../../prompt-manage/PromptManager";
import { ChatMessage, ChatRole } from "../../../llm-provider/ChatMessage";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor-api/AutoDevStatusManager";
import { LlmProvider } from "../../../llm-provider/LlmProvider";
import { FencedCodeBlock } from "../../../markdown/FencedCodeBlock";
import { CreateToolchainContext } from "../../../toolchain-context/ToolchainContextProvider";
import { ActionType } from "../../../prompt-manage/ActionType";

export class AutoTestActionExecutor implements ActionExecutor {
	type: ActionType = ActionType.AutoTest;

	private document: vscode.TextDocument;
	private range: NamedElementBlock;
	private edit: vscode.WorkspaceEdit;
	private language: string;

	constructor(document: vscode.TextDocument, range: NamedElementBlock, edit: vscode.WorkspaceEdit) {
		this.document = document;
		this.range = range;
		this.edit = edit;
		this.language = document.languageId;
	}

	async execute(): Promise<void> {
		let testGen = TestGenProviderManager.getInstance();
		let provider = await testGen.provide(this.language);

		if (provider?.isApplicable(this.language) !== true) {
			return;
		}

		let testContext = await provider.findOrCreateTestFile(this.document, this.range);
		testContext.sourceCode = this.range.blockRange.text;

		const creationContext: CreateToolchainContext = {
			action: "AutoDocAction",
			filename: this.document.fileName,
			language: this.language,
			content: this.document.getText(),
			block: this.range
		};

		const contextItems = await PromptManager.getInstance().collectToolchain(creationContext);
		if (contextItems.length > 0) {
			testContext.chatContext = contextItems.map(item => item.text).join("\n - ");
			console.info(`chat context: ${testContext.chatContext}`);
		}

		let content = await PromptManager.getInstance().templateToPrompt(ActionType.AutoTest, testContext);
		console.info(`request: ${content}`);

		let msg: ChatMessage = {
			role: ChatRole.User,
			content: content
		};

		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.InProgress);
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
		const output = FencedCodeBlock.parse(doc).text;

		console.info(`FencedCodeBlock parsed output: ${output}`);
		// write to output file
		const outputFile = testContext.targetPath;
		await vscode.workspace.fs.writeFile(vscode.Uri.file(outputFile!!), Buffer.from(output));
	}
}