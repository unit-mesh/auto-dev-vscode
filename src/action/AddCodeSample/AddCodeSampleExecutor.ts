import fs from 'fs';
import { AutoDevExtension } from 'src/AutoDevExtension';
import { Position, TextDocument, WorkspaceEdit } from 'vscode';
import vscode from 'vscode';
import { SyntaxNode } from 'web-tree-sitter';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { IDataStorage } from 'base/common/workspace/WorkspaceService';

import { type NamedElement } from '../../editor/ast/NamedElement';
import { insertCodeByRange, selectCodeInRange } from '../../editor/ast/PositionUtil';
import { AutoDevStatus, AutoDevStatusManager } from '../../editor/editor-api/AutoDevStatusManager';
import { ActionType } from '../../prompt-manage/ActionType';
import { PromptManager } from '../../prompt-manage/PromptManager';
import { ActionExecutor } from '../_base/ActionExecutor';
import { Hash } from 'crypto';

export class AddCodeSampleExecutor implements ActionExecutor {

	public static readonly LanguageSupport:Set<string>=new Set<string>(["csharp"])
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
		this.statusBarManager.setStatus(AutoDevStatus.InProgress);

		selectCodeInRange(range.blockRange.start, range.blockRange.end);
		if (range.commentRange) {
			selectCodeInRange(range.commentRange.start, range.commentRange.end);
		}
		this.autodev.workSpace.AddDataStorage(language, new CodeSample(range.node, document.uri.fsPath));
	}

}
export class CodeSample  implements IDataStorage {

	public  code: string= '';
	public  doc: string= '';
	public  filePath: string=	'';
	public  codeContext: string=	'';

	constructor(node: SyntaxNode, filePath: string= '') {
		this.code = node.text;
		this.doc = '';
		this.codeContext = '';
		if (node.previousSibling) {
			this.doc = this.Getcommits(node.previousSibling, []).reverse().toString();
		}

		this.filePath = filePath;
	}
	protected Getcommits(node: SyntaxNode, commits: string[]): string[]
		{
			if (node.type === 'comment') {
				commits.push(node.text);
				if (node.previousSibling) {
					return this.Getcommits(node.previousSibling, commits);
				} else {
					return commits;
				}
			} else {
				return commits;
			}
	}
	equals(other: CodeSample): boolean {
		if (!other) {
			return false;
		}
		// if (!(other instanceof CodeSample)) {
		// 	return false;
		// }
		if (other.code === this.code && other.doc === this.doc && other.filePath === this.filePath) {
			return true;
		}

		return false;
	}
	GetType(): string {
		return CodeSample.name;
	}
	public static DeserializationFormJson(data: any): CodeSample {
   let codeSample = new CodeSample(data);
	 codeSample.code = data.code;
	 codeSample.doc = data.doc;
	 codeSample.filePath = data.filePath;
	 codeSample.codeContext = data.codeContext;
		return codeSample;
	}
	public static DeserializationFormSql(data: any): CodeSample {
		let codeSample = new CodeSample(data);
		codeSample.code = data.code;
		codeSample.doc = data.doc;
		codeSample.filePath = data.filePath;
		codeSample.codeContext = data.codeContext;
		 return codeSample;
	 }
}
