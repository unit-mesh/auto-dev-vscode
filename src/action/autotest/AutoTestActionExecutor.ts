import { AutoDevExtension } from 'src/AutoDevExtension';
import vscode, { env } from 'vscode';

import { ChatMessageRole, IChatMessage } from 'base/common/language-models/languageModels';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { logger } from 'base/common/log/log';
import { StreamingMarkdownCodeBlock } from 'base/common/markdown/StreamingMarkdownCodeBlock';
import { showErrorMessage } from 'base/common/messages/messages';

import { RelevantCodeProviderManager } from '../../code-context/RelevantCodeProviderManager';
import { TestGenProviderManager } from '../../code-context/TestGenProviderManager';
import { NamedElement } from '../../editor/ast/NamedElement';
import { AutoDevStatus, AutoDevStatusManager } from '../../editor/editor-api/AutoDevStatusManager';
import { ActionType } from '../../prompt-manage/ActionType';
import { PromptManager } from '../../prompt-manage/PromptManager';
import { CreateToolchainContext } from '../../toolchain-context/ToolchainContextProvider';
import { ActionExecutor } from '../_base/ActionExecutor';

export class AutoTestActionExecutor implements ActionExecutor {
	type: ActionType = ActionType.AutoTest;

	private lm: LanguageModelsService;
	private promptManager: PromptManager;
	private statusBarManager: AutoDevStatusManager;

	private document: vscode.TextDocument;
	private namedElement: NamedElement;
	private edit?: vscode.WorkspaceEdit;
	private language: string;

	private testGen: TestGenProviderManager;
	private relevantCodeProviderManager: RelevantCodeProviderManager;

	constructor(
		private autodev: AutoDevExtension,
		document: vscode.TextDocument,
		range: NamedElement,
		edit?: vscode.WorkspaceEdit,
	) {
		this.lm = autodev.lm;
		this.promptManager = autodev.promptManager;
		this.statusBarManager = autodev.statusBarManager;

		this.document = document;
		this.namedElement = range;
		this.edit = edit;
		this.language = document.languageId;

		this.testGen = new TestGenProviderManager(autodev.lsp);
		this.relevantCodeProviderManager = new RelevantCodeProviderManager(autodev.lsp);
	}

	async execute(): Promise<void> {
		let testgen = await this.testGen.provide(this.language);

		if (testgen?.isApplicable(this.language) !== true) {
			return;
		}

		this.autodev.statusBarManager.setStatus(AutoDevStatus.InProgress);

		try {
			const testContext = await testgen.setupTestFile(this.document, this.namedElement);

			let file = await this.autodev.treeSitterFileManager.create(this.document);

			testContext.relatedClasses = await this.relevantCodeProviderManager.relatedClassesContext(
				this.language,
				file,
				this.namedElement,
			);

			const startTime = new Date().getTime();
			console.log('startTime: ', startTime);

			const creationContext: CreateToolchainContext = {
				action: 'AutoTestAction',
				filename: this.document.fileName,
				language: this.language,
				content: this.document.getText(),
				element: this.namedElement,
			};

			// TODO: spike better way to improve performance
			let toolchainContextItems = await this.promptManager.collectToolchain(creationContext);
			let languageContextItems = await testgen.additionalTestContext(testContext);

			const toolchainItems = toolchainContextItems.concat(languageContextItems);
			if (toolchainItems.length > 0) {
				testContext.chatContext = toolchainItems.map(item => item.text).join('\n - ');
			} else {
				testContext.chatContext = '';
			}

			// end time
			const endTime = new Date().getTime();
			console.log('endTime: ', startTime);
			console.info(`Time taken to collect context: ${endTime - startTime}ms`);

			let content = await this.promptManager.generateInstruction(ActionType.AutoTest, testContext);
			console.info(`user prompt: ${content}`);

			let msg: IChatMessage = {
				role: ChatMessageRole.User,
				content: content,
			};

			let doc: string = '';

			// navigate to test file
			await vscode.window.showTextDocument(vscode.Uri.file(testContext.targetPath!!));

			const outputFile = testContext.targetPath;
			let newDocUri = vscode.Uri.file(outputFile!!);

			let editor = vscode.window.activeTextEditor!!;
			const cancellation = new vscode.CancellationTokenSource();

			await this.lm.chat(
				[msg],
				{},
				{
					report: async fragment => {
						doc += fragment.part;

						const output = StreamingMarkdownCodeBlock.parse(doc, this.language).text;

						if (output) {
							let workspaceEdit = new vscode.WorkspaceEdit();
							workspaceEdit.replace(newDocUri, new vscode.Range(0, 0, editor.document.lineCount, 0), output);
							await vscode.workspace.applyEdit(workspaceEdit);
						}
					},
				},
				cancellation.token,
			);

			this.autodev.statusBarManager.setStatus(AutoDevStatus.Done);

			const output = StreamingMarkdownCodeBlock.parse(doc, this.language).text;
			logger.info(`FencedCodeBlock parsed output: ${output}`);

			const newDoc = await vscode.workspace.openTextDocument(newDocUri);
			await testgen.postProcessCodeFix(newDoc, output);

			logger.debug('result', doc);

			// if new file is empty, console.error and remove file
			if (newDoc.getText().length === 0) {
				console.error('Empty file, removing...');
				await vscode.workspace.fs.delete(newDocUri);
			}
		} catch (e) {
			logger.error('(AutoTestAction): error', e);
			showErrorMessage('Auto Test Action Error');
			this.autodev.statusBarManager.setStatus(AutoDevStatus.Error);
		}
	}
}
