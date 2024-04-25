import vscode, { Position } from "vscode";

import { NamedElement } from "../../ast/NamedElement";
import { LANGUAGE_BLOCK_COMMENT_MAP } from "../../language/LanguageCommentMap";
import { PromptManager } from "../../../prompt-manage/PromptManager";
import { LlmProvider } from "../../../llm-provider/LlmProvider";
import { ChatMessage, ChatRole } from "../../../llm-provider/ChatMessage";
import { insertCodeByRange, selectCodeInRange } from "../../editor";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor-api/AutoDevStatusManager";
import { FencedCodeBlock } from "../../../markdown/FencedCodeBlock";
import { CreateToolchainContext } from "../../../toolchain-context/ToolchainContextProvider";
import { ActionExecutor } from "../_base/ActionExecutor";
import { AutoDocTemplateContext } from "./AutoDocTemplateContext";
import { MarkdownTextProcessor } from "../../../markdown/MarkdownTextProcessor";
import { ActionType } from "../../../prompt-manage/ActionType";

export class AutoDocActionExecutor implements ActionExecutor {
	type: ActionType = ActionType.AutoDoc;

	private document: vscode.TextDocument;
	private range: NamedElement;
	private edit: vscode.WorkspaceEdit;
	private language: string;

	constructor(document: vscode.TextDocument, range: NamedElement, edit: vscode.WorkspaceEdit) {
		this.document = document;
		this.range = range;
		this.edit = edit;
		this.language = document.languageId;
	}

	async execute() {
		const startSymbol = LANGUAGE_BLOCK_COMMENT_MAP[this.language].start;
		const endSymbol = LANGUAGE_BLOCK_COMMENT_MAP[this.language].end;

		const templateContext: AutoDocTemplateContext = {
			language: this.language,
			startSymbol: startSymbol,
			endSymbol: endSymbol,
			code: this.document.getText(this.range.blockRange),
			forbiddenRules: [],
			// 原有注释
			originalComments: []
		};

		if (this.range.commentRange) {
			templateContext.originalComments.push(this.document.getText(this.range.commentRange));
		}

		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.InProgress);

		selectCodeInRange(this.range.blockRange.start, this.range.blockRange.end);
		if (this.range.commentRange) {
			selectCodeInRange(this.range.commentRange.start, this.range.commentRange.end);
		}

		const creationContext: CreateToolchainContext = {
			action: "AutoDocAction",
			filename: this.document.fileName,
			language: this.language,
			content: this.document.getText(),
			block: this.range
		};

		const contextItems = await PromptManager.getInstance().collectToolchain(creationContext);
		if (contextItems.length > 0) {
			templateContext.chatContext = contextItems.map(item => item.text).join("\n - ");
			console.info(`chat context: ${templateContext.chatContext}`);
		}

		let content = await PromptManager.getInstance().templateToPrompt(ActionType.AutoDoc, templateContext);
		console.info(`request: ${content}`);

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
		const finalText = FencedCodeBlock.parse(doc).text;

		console.info(`FencedCodeBlock parsed output: ${finalText}`);
		let document = MarkdownTextProcessor.buildDocFromSuggestion(doc, startSymbol, endSymbol);

		// todo: parse comments
		let startLine = this.range.blockRange.start.line;
		if (startLine === 0) {
			startLine = 1;
		}
		let textRange: Position = new Position(startLine - 1, 0);
		insertCodeByRange(textRange, document);
	}
}
