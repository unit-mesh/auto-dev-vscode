import { AutoDevExtension } from 'src/AutoDevExtension';
import { CancellationTokenSource, Position, TextDocument, WorkspaceEdit } from 'vscode';

import { ChatMessageRole, IChatMessage } from 'base/common/language-models/languageModels';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { LANGUAGE_BLOCK_COMMENT_MAP } from 'base/common/languages/docstring';
import { log } from 'base/common/log/log';
import { MarkdownTextProcessor } from 'base/common/markdown/MarkdownTextProcessor';
import { StreamingMarkdownCodeBlock } from 'base/common/markdown/StreamingMarkdownCodeBlock';

import { type NamedElement } from '../../editor/ast/NamedElement';
import { insertCodeByRange, selectCodeInRange } from '../../editor/ast/PositionUtil';
import { AutoDevStatus, AutoDevStatusManager } from '../../editor/editor-api/AutoDevStatusManager';
import { ActionType } from '../../prompt-manage/ActionType';
import { PromptManager } from '../../prompt-manage/PromptManager';
import { CreateToolchainContext } from '../../toolchain-context/ToolchainContextProvider';
import { ActionExecutor } from '../_base/ActionExecutor';
import { AutoDocTemplateContext } from './AutoDocTemplateContext';

export class AutoDocActionExecutor implements ActionExecutor {
	type: ActionType = ActionType.AutoDoc;

	private lm: LanguageModelsService;
	private promptManager: PromptManager;
	private statusBarManager: AutoDevStatusManager;

	private document: TextDocument;
	private range: NamedElement;
	private edit?: WorkspaceEdit;
	private language: string;

	constructor(autodev: AutoDevExtension, document: TextDocument, range: NamedElement, edit?: WorkspaceEdit) {
		this.lm = autodev.lm;
		this.promptManager = autodev.promptManager;
		this.statusBarManager = autodev.statusBarManager;

		this.document = document;
		this.range = range;
		this.edit = edit;
		this.language = document.languageId;
	}

	async execute() {
		const document = this.document;
		const range = this.range;
		const language = document.languageId;

		const startSymbol = LANGUAGE_BLOCK_COMMENT_MAP[language]!.start;
		const endSymbol = LANGUAGE_BLOCK_COMMENT_MAP[language]!.end;

		const templateContext: AutoDocTemplateContext = {
			language: language,
			startSymbol: startSymbol,
			endSymbol: endSymbol,
			code: document.getText(range.blockRange),
			forbiddenRules: [],
			// 原有注释
			originalComments: [],
		};

		if (range.commentRange) {
			templateContext.originalComments.push(document.getText(range.commentRange));
		}

		this.statusBarManager.setStatus(AutoDevStatus.InProgress);

		selectCodeInRange(range.blockRange.start, range.blockRange.end);
		if (range.commentRange) {
			selectCodeInRange(range.commentRange.start, range.commentRange.end);
		}

		const creationContext: CreateToolchainContext = {
			action: 'AutoDocAction',
			filename: document.fileName,
			language: language,
			content: document.getText(),
			element: range,
		};

		const contextItems = await this.promptManager.collectToolchain(creationContext);
		if (contextItems.length > 0) {
			templateContext.chatContext = contextItems.map(item => item.text).join('\n - ');
		}

		let content = await this.promptManager.generateInstruction(ActionType.AutoDoc, templateContext);
		log(`request: ${content}`);

		let msg: IChatMessage = {
			role: ChatMessageRole.User,
			content: content,
		};

		try {
			const doc = await this.lm.chat([msg], {});

			this.statusBarManager.setStatus(AutoDevStatus.Done);
			const finalText = StreamingMarkdownCodeBlock.parse(doc).text;

			log(`FencedCodeBlock parsed output: ${finalText}`);

			let docstring = MarkdownTextProcessor.buildDocFromSuggestion(doc, startSymbol, endSymbol);

			let startLine = range.blockRange.start.line;
			let startChar = range.blockRange.start.character;

			if (startLine === 0) {
				startLine = 1;
			}

			// todo: add format by indent.

			const textRange: Position = new Position(startLine - 1, startChar);
			insertCodeByRange(textRange, docstring);
		} catch (e) {
			console.error(e);
			this.statusBarManager.setStatus(AutoDevStatus.Error);
			return;
		}
	}
}
