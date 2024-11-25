import fs from 'fs';
import { AutoDevExtension } from 'src/AutoDevExtension';
import { Position, TextDocument, WorkspaceEdit } from 'vscode';
import vscode from 'vscode';

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
import { CsharpFrameworkCodeFragmentExtractor } from 'src/code-context/csharp/model/CsharpFrameworkCodeFragmentExtractor';

export class AddFrameworkCodeFragmentExecutor implements ActionExecutor {
	type: ActionType = ActionType.AutoDoc;

	private lm: LanguageModelsService;
	private promptManager: PromptManager;
	private statusBarManager: AutoDevStatusManager;

	private document: TextDocument;
	private range: NamedElement;
	private edit?: WorkspaceEdit;
	private language: string;
	private autodev: AutoDevExtension;

	constructor(autodev: AutoDevExtension, document: TextDocument, range: NamedElement, edit?: WorkspaceEdit) {
		this.lm = autodev.lm;
		this.promptManager = autodev.promptManager;
		this.statusBarManager = autodev.statusBarManager;

		this.document = document;
		this.range = range;
		this.edit = edit;
		this.language = document.languageId;
		this.autodev = autodev;
	}

	async execute() {

		const document = this.document;
		const range = this.range;
		const language = document.languageId;

		const startSymbol = LANGUAGE_BLOCK_COMMENT_MAP[language]!.start;
		const endSymbol = LANGUAGE_BLOCK_COMMENT_MAP[language]!.end;
    const frameworkCodeFragmentInfo=new CsharpFrameworkCodeFragmentExtractor(range.node,document.uri.fsPath).ExtractFrameworkCodeFragment();
		this.autodev.workSpace.AddDataStorage(language,frameworkCodeFragmentInfo)
		this.statusBarManager.setStatus(AutoDevStatus.InProgress);
		selectCodeInRange(range.blockRange.start, range.blockRange.end);
		if (range.commentRange) {
			selectCodeInRange(range.commentRange.start, range.commentRange.end);
		}
	}
}