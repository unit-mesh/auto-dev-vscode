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
import { AutoMethodTemplateContext } from './AutoMethodTemplateContext';
import { CsharpClassExtractor } from 'src/code-context/csharp/model/CsharpClassExtractor';
import { CodeSample } from '../addCodeSamples/AddCodeSampleExecutor';
import { FrameworkCodeFragment } from 'src/code-context/_base/LanguageModel/ClassElement/FrameworkCodeFragmentExtractorBase';
import { ClassExtractorFactory } from 'src/code-context/_base/LanguageModel/ClassELementFactory/ClassExtarctorFactory';

export class AutoMethodActionExecutor implements ActionExecutor {
	type: ActionType = ActionType.AutoDoc;
	public static readonly LanguageSupport:Set<string>=new Set<string>(["csharp"])
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

    const classExtractor=ClassExtractorFactory.createInstance(language,range.node.parent?.parent!);
    const classInfo=classExtractor.ExtractClass();
    let selectGroup=this.autodev.workSpace.DataStorageGroupManager?.GetSelectedGroup();
		let codeSampleIds=selectGroup?.get(CodeSample.name);
		let codeSamples:CodeSample[]=[];
		let customFrameworkCodeFragments:FrameworkCodeFragment[]=[];
		let customFrameworkCodeFragmentIds=selectGroup?.get(FrameworkCodeFragment.name);
		if(customFrameworkCodeFragmentIds!=undefined)
		{
      customFrameworkCodeFragments=this.autodev.workSpace.GetDataStoragesByIds(language,FrameworkCodeFragment.name,customFrameworkCodeFragmentIds) as FrameworkCodeFragment[]
		}
		if(codeSampleIds!=undefined)
		{
      codeSamples=this.autodev.workSpace.GetDataStoragesByIds(language,CodeSample.name,codeSampleIds) as CodeSample[]
		}

		const templateContext: AutoMethodTemplateContext ={
			language: language,
			startSymbol: startSymbol,
			endSymbol: endSymbol,
			code: document.getText(range.blockRange),
			forbiddenRules: [],
			classInfo:classInfo,
			customFrameworkCodeFragments:customFrameworkCodeFragments,
		  codeSamples:codeSamples
		};


		this.statusBarManager.setStatus(AutoDevStatus.InProgress);

		selectCodeInRange(range.blockRange.start, range.blockRange.end);
		if (range.commentRange) {
			selectCodeInRange(range.commentRange.start, range.commentRange.end);
		}

		const creationContext: CreateToolchainContext = {
			action: 'AutoMethodAction',
			filename: document.fileName,
			language: language,

			content: document.getText(),
			element: range,
		};

		const contextItems = await this.promptManager.collectToolchain(creationContext);
		if (contextItems.length > 0) {
			templateContext.chatContext = contextItems.map(item => item.text).join('\n - ');
		}

		let content = await this.promptManager.generateInstruction(ActionType.AutoMethod, templateContext);
		log(`request: ${content}`);
		console.log(`generateInstruction: ${content}`);

		let msg: IChatMessage = {
			role: ChatMessageRole.User,
			content: content,
		};

		try {
			const doc = await this.lm.chat([msg], {});

			this.statusBarManager.setStatus(AutoDevStatus.Done);
			const finalText = StreamingMarkdownCodeBlock.parse(doc).text;

			log(`FencedCodeBlock parsed output: ${finalText}`);

			let codestring = MarkdownTextProcessor.buildDocFromSuggestion(doc, startSymbol, endSymbol);

			let startLine = range.blockRange.start.line;
			let startChar = range.blockRange.start.character;

			if (startLine === 0) {
				startLine = 1;
			}

			// todo: add format by indent.

			const textRange: Position = new Position(startLine - 1, startChar);
			insertCodeByRange(textRange, codestring);
		} catch (e) {
			console.error(e);
			this.statusBarManager.setStatus(AutoDevStatus.Error);
			return;
		}
	}
}
