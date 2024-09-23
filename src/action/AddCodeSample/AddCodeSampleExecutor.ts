import fs from 'fs';
import { AutoDevExtension } from 'src/AutoDevExtension';
import { BaseCsharpElement } from 'src/code-context/csharp/model/BaseCsharpElement';
import { CsharpClassExtractor } from 'src/code-context/csharp/model/CsharpClassExtractor';
import { Position, TextDocument, WorkspaceEdit } from 'vscode';
import vscode from 'vscode';
import { SyntaxNode } from 'web-tree-sitter';

import { ChatMessageRole, IChatMessage } from 'base/common/language-models/languageModels';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { LANGUAGE_BLOCK_COMMENT_MAP } from 'base/common/languages/docstring';
import { log } from 'base/common/log/log';
import { MarkdownTextProcessor } from 'base/common/markdown/MarkdownTextProcessor';
import { StreamingMarkdownCodeBlock } from 'base/common/markdown/StreamingMarkdownCodeBlock';
import { IDataStorage } from 'base/common/workspace/WorkspaceService';

import { type NamedElement } from '../../editor/ast/NamedElement';
import { insertCodeByRange, selectCodeInRange } from '../../editor/ast/PositionUtil';
import { AutoDevStatus, AutoDevStatusManager } from '../../editor/editor-api/AutoDevStatusManager';
import { ActionType } from '../../prompt-manage/ActionType';
import { PromptManager } from '../../prompt-manage/PromptManager';
import { CreateToolchainContext } from '../../toolchain-context/ToolchainContextProvider';
import { ActionExecutor } from '../_base/ActionExecutor';

export class AddCodeSampleExecutor implements ActionExecutor {
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
		const classInfo = new CsharpClassExtractor(this.range.node).ExtractClass();
		this.statusBarManager.setStatus(AutoDevStatus.InProgress);

		selectCodeInRange(range.blockRange.start, range.blockRange.end);
		if (range.commentRange) {
			selectCodeInRange(range.commentRange.start, range.commentRange.end);
		}
		this.autodev.workSpace.AddDataStorage(language,new CodeSample(range.node, document.uri.fsPath));
	}

	// 在vscode插件开发下，写一个类，将对象转json字符串并保存的代码要求如下
	// 1.当工作区关闭时，json字符串保存在workspace的.vscode文件夹下,名称为当前代码文件的编程语言名外接.json后缀
	// 2.当工作区打开时，读取保存在workspace的.vscode文件夹下的名称为当前代码文件的编程语言名的json文件，并将其反序列化为特定对象
}
export class CodeSample extends BaseCsharpElement implements IDataStorage {
	public readonly code: string;
	public readonly doc: string;
	public readonly context: string;
	public readonly filePath: string;
	constructor(node: SyntaxNode, filePath: string) {
		super();
		this.code = node.text;
		this.doc = '';
		if (node.previousSibling) {
			this.doc = this.Getcommits(node.previousSibling, []).reverse().toString();
		}

		this.context = 'context';
		this.filePath = filePath;
	}
	equals(other: CodeSample): boolean {
		if (
			other.code === this.code &&
			other.doc === this.doc &&
			other.context === this.context &&
			other.filePath === this.filePath
		) {
			return true;
		}

		return false;
	}
	GetType(): string {
		return CodeSample.name;
	}
	Save(): void {
		throw new Error('Method not implemented.');
	}
	Load(): void {
		throw new Error('Method not implemented.');
	}
}
