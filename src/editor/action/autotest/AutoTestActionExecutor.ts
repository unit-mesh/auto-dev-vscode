import vscode, { env } from "vscode";

import { ActionExecutor } from "../_base/ActionExecutor";
import { NamedElement } from "../../ast/NamedElement";
import { TestGenProviderManager } from "../../../code-context/TestGenProviderManager";
import { PromptManager } from "../../../prompt-manage/PromptManager";
import { ChatMessage, ChatRole } from "../../../llm-provider/ChatMessage";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor-api/AutoDevStatusManager";
import { LlmProvider } from "../../../llm-provider/LlmProvider";
import { StreamingMarkdownCodeBlock } from "../../../markdown/StreamingMarkdownCodeBlock";
import { CreateToolchainContext } from "../../../toolchain-context/ToolchainContextProvider";
import { ActionType } from "../../../prompt-manage/ActionType";
import { RelevantCodeProviderManager } from "../../../code-context/RelevantCodeProviderManager";
import { channel } from "../../../channel";
import { TreeSitterFileManager } from "../../cache/TreeSitterFileManager";

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

		AutoDevStatusManager.instance.setStatus(AutoDevStatus.InProgress);

		const testContext = await testgen.setupTestFile(this.document, this.namedElement);

		let file = await TreeSitterFileManager.create(this.document);

		let relevantCodeProviderManager = RelevantCodeProviderManager.getInstance();
		testContext.relatedClasses = await relevantCodeProviderManager.relatedClassesContext(this.language, file, this.namedElement);

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
		let languageContextItems = await testgen.additionalTestContext(testContext);

		const toolchainItems = toolchainContextItems.concat(languageContextItems);
		if (toolchainItems.length > 0) {
			testContext.chatContext = toolchainItems.map(item => item.text).join("\n - ");
		} else {
			testContext.chatContext = '';
		}

		// end time
		const endTime = new Date().getTime();
		console.log("endTime: ", startTime);
		console.info(`Time taken to collect context: ${endTime - startTime}ms`);

		let content = await PromptManager.getInstance().generateInstruction(ActionType.AutoTest, testContext);
		console.info(`user prompt: ${content}`);

		let msg: ChatMessage = {
			role: ChatRole.User,
			content: content
		};

		let llm = LlmProvider.chatCompletion();
		let doc: string = "";

		// navigate to test file
		await vscode.window.showTextDocument(vscode.Uri.file(testContext.targetPath!!));

		const outputFile = testContext.targetPath;
		let newDocUri = vscode.Uri.file(outputFile!!);

		let editor = vscode.window.activeTextEditor!!;

		try {
			for await (const chunk of llm._streamChat([msg])) {
				doc += chunk.content;

				const output = StreamingMarkdownCodeBlock.parse(doc, this.language).text;

				if (output) {
					let workspaceEdit = new vscode.WorkspaceEdit();
					workspaceEdit.replace(newDocUri, new vscode.Range(0, 0, editor.document.lineCount, 0), output);
					await vscode.workspace.applyEdit(workspaceEdit);
				}
			}
		} catch (e) {
			console.error(e);
			AutoDevStatusManager.instance.setStatus(AutoDevStatus.Error);
			return;
		}

		AutoDevStatusManager.instance.setStatus(AutoDevStatus.Done);

		const output = StreamingMarkdownCodeBlock.parse(doc, this.language).text;
		console.info(`FencedCodeBlock parsed output: ${output}`);

		const newDoc = await vscode.workspace.openTextDocument(newDocUri);
		await testgen.postProcessCodeFix(newDoc, output);

		channel.append(doc);

		// if new file is empty, console.error and remove file
		if (newDoc.getText().length === 0) {
			console.error("Empty file, removing...");
			await vscode.workspace.fs.delete(newDocUri);
		}
	}
}