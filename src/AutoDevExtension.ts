import { inject, injectable } from 'inversify';
import { CancellationToken, Disposable, ProgressLocation, TextDocument, window, WorkspaceEdit } from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';
import { IExtensionContext } from 'base/common/configuration/context';
import { ContextStateService } from 'base/common/configuration/contextState';
import { WorkspaceFileSystem } from 'base/common/fs';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';
import { logger } from 'base/common/log/log';
import { WorkspaceService } from 'base/common/workspace/WorkspaceService';

import { AddFrameworkCodeFragmentExecutor } from './action/addCodeFragment/AddFrameworkCodeFragmentExecutor';
import { AddCodeSampleExecutor } from './action/addCodeSample/AddCodeSampleExecutor';
import { AutoDocActionExecutor } from './action/autodoc/AutoDocActionExecutor';
import { AutoMethodActionExecutor } from './action/autoMethod/AutoMethodActionExecutor';
import { AutoTestActionExecutor } from './action/autotest/AutoTestActionExecutor';
import {
	registerAutoDevProviders,
	registerCodeLensProvider,
	registerCodeSuggestionProvider,
	registerQuickFixProvider,
	registerRenameAction,
} from './action/ProviderRegister';
import { RemoveCodeSampleExecutor } from './action/removeCodeSample/RemoveCodeSampleExecutor';
import { SystemActionService } from './action/setting/SystemActionService';
import { Catalyser } from './agent/catalyser/Catalyser';
import { LanguageModelsService } from './base/common/language-models/languageModelsService';
import { ChunkerManager } from './code-search/chunk/ChunkerManager';
import { CodebaseIndexer } from './code-search/indexing/CodebaseIndexer';
import { LanceDbIndex } from './code-search/indexing/LanceDbIndex';
import { DefaultRetrieval } from './code-search/retrieval/DefaultRetrieval';
import { RetrieveOption } from './code-search/retrieval/Retrieval';
import { TeamTermService } from './domain/TeamTermService';
import { NamedElement } from './editor/ast/NamedElement';
import { TreeSitterFileManager } from './editor/cache/TreeSitterFileManager';
import { AutoDevStatusManager } from './editor/editor-api/AutoDevStatusManager';
import { QuickActionService } from './editor/editor-api/QuickAction';
import { VSCodeAction } from './editor/editor-api/VSCodeAction';
import { ChatViewService } from './editor/views/chat/chatViewService';
import { ActionType } from './prompt-manage/ActionType';
import { CustomActionExecutor } from './prompt-manage/custom-action/CustomActionExecutor';
import { VSCodeTemplateLoader } from './prompt-manage/loader/VSCodeTemplateLoader';
import { PromptManager } from './prompt-manage/PromptManager';
import { TeamPromptsBuilder } from './prompt-manage/team-prompts/TeamPromptsBuilder';
import { TemplateContext } from './prompt-manage/template/TemplateContext';
import { TemplateRender } from './prompt-manage/template/TemplateRender';
import { IProjectService } from './ProviderTypes';
import { ToolchainContextManager } from './toolchain-context/ToolchainContextManager';

@injectable()
export class AutoDevExtension {
	// Vscode
	ideAction: VSCodeAction;
	statusBarManager: AutoDevStatusManager;
	quickAction: QuickActionService;
	systemAction: SystemActionService;

	// Ast
	treeSitterFileManager: TreeSitterFileManager;

	// Agents
	catalyser: Catalyser;

	// Toolchain
	promptManager: PromptManager;
	teamPromptsBuilder: TeamPromptsBuilder;
	toolchainContextManager: ToolchainContextManager;

	// Storages
	private vectorStore: LanceDbIndex;
	retrieval: DefaultRetrieval;
	codebaseIndexer: CodebaseIndexer;

	constructor(
		@inject(ConfigurationService)
		public config: ConfigurationService,

		@inject(IExtensionContext)
		public extensionContext: IExtensionContext,

		@inject(ContextStateService)
		public contextState: ContextStateService,

		@inject(LanguageModelsService)
		public lm: LanguageModelsService,

		@inject(ILanguageServiceProvider)
		public lsp: ILanguageServiceProvider,

		@inject(WorkspaceFileSystem)
		public fs: WorkspaceFileSystem,

		@inject(ChatViewService)
		public chat: ChatViewService,

		@inject(IProjectService)
		public teamTerm: TeamTermService,
		@inject(WorkspaceService)
		public workSpace: WorkspaceService,
	) {
		this.ideAction = new VSCodeAction();
		this.statusBarManager = new AutoDevStatusManager();

		const templateLoader = new VSCodeTemplateLoader(this.extensionContext.extensionUri);
		const templateRender = new TemplateRender(templateLoader);

		this.catalyser = new Catalyser(this, this.teamTerm);

		this.teamPromptsBuilder = new TeamPromptsBuilder(this.config);
		this.quickAction = new QuickActionService(
			this.teamPromptsBuilder,
			new CustomActionExecutor(this.lm, templateRender, this.statusBarManager),
			this,
		);

		this.systemAction = new SystemActionService(this);

		this.toolchainContextManager = new ToolchainContextManager();
		this.promptManager = new PromptManager(this.extensionContext, this.toolchainContextManager);

		this.treeSitterFileManager = new TreeSitterFileManager(this.lsp);

		const chunkerManager = new ChunkerManager(this.lsp);

		this.vectorStore = new LanceDbIndex(this.lm, path => this.ideAction.readFile(path), chunkerManager);
		this.codebaseIndexer = new CodebaseIndexer(this.ideAction, this.vectorStore, this.lsp, chunkerManager);
		this.retrieval = new DefaultRetrieval(this.vectorStore);
	}

	/**
	 * @deprecated This is compatible with the object, please do not use
	 */
	get embeddingsProvider() {
		const model = this.lm.resolveEmbeddingModel({});

		return {
			id: model.identifier,
			embed(input: string[]) {
				return model.provideEmbedDocuments(input, {});
			},
		};
	}

	async createCodebaseIndex() {
		const granted = await this.contextState.requestAccessUserCodebasePermission({
			modal: true,
		});

		if (!granted) {
			return;
		}

		this.statusBarManager.setIsLoading('Codebase indexing...');
		this.contextState.setCodebaseIndexingStatus(true);

		try {
			await window.withProgress(
				{
					location: ProgressLocation.Notification,
					title: 'Codebase',
					cancellable: true,
				},
				async (progress, token) => {
					const workspaceDirs = this.ideAction.getWorkspaceDirectories();

					for await (const update of this.codebaseIndexer.refresh(workspaceDirs, token)) {
						progress.report({
							increment: update.progress * 10,
							message: update.desc,
						});
						logger.debug(update.desc);
					}
				},
			);
		} catch (error) {
			logger.error((error as Error).message);
			logger.show(false);
		} finally {
			this.contextState.setCodebaseIndexingStatus(false);
			this.statusBarManager.reset();
		}
	}

	async retrievalCode(query: string, options: RetrieveOption, token?: CancellationToken) {
		const granted = await this.contextState.requestAccessUserCodebasePermission({
			modal: true,
		});

		if (!granted) {
			return [];
		}

		// TODO check if the codebase is indexed?

		const model = this.lm.resolveEmbeddingModel({});

		const results = await this.retrieval.retrieve(
			query,
			this.ideAction,
			{
				id: model.identifier,
				embed(input: string[]) {
					return model.provideEmbedDocuments(input, {}, token);
				},
			},
			options,
		);

		return results;
	}

	generateInstruction(type: ActionType, context: TemplateContext) {
		return this.promptManager.generateInstruction(type, context);
	}

	showChatPanel() {
		this.chat.show();
	}

	newChatSession(prompt?: string) {
		this.chat.newSession(prompt);
		this.chat.show();
	}

	addValueToChatInput(value: string) {
		this.chat.input(value);
		this.chat.show();
	}

	executeAutoDocAction(document: TextDocument, nameElement: NamedElement, edit?: WorkspaceEdit) {
		return new AutoDocActionExecutor(this, document, nameElement, edit).execute();
	}
	executeAutoMethodAction(document: TextDocument, nameElement: NamedElement, edit?: WorkspaceEdit) {
		return new AutoMethodActionExecutor(this, document, nameElement, edit).execute();
	}
	executeAddCodeSampleExecutorAction(document: TextDocument, nameElement: NamedElement, edit?: WorkspaceEdit) {
		return new AddCodeSampleExecutor(this, document, nameElement, edit).execute();
	}
	executeRemoveCodeSampleExecutorAction(document: TextDocument, nameElement: NamedElement, edit?: WorkspaceEdit) {
		return new RemoveCodeSampleExecutor(this, document, nameElement, edit).execute();
	}

	executeAddFrameworkCodeFragmentAction(document: TextDocument, nameElement: NamedElement, edit?: WorkspaceEdit) {
		return new AddFrameworkCodeFragmentExecutor(this, document, nameElement, edit).execute();
	}

	executeRemoveFrameworkCodeFragmentAction(document: TextDocument, nameElement: NamedElement, edit?: WorkspaceEdit) {
		return new RemoveCodeSampleExecutor(this, document, nameElement, edit).execute();
	}

	executeAutoTestAction(document: TextDocument, nameElement: NamedElement, edit?: WorkspaceEdit) {
		return new AutoTestActionExecutor(this, document, nameElement, edit).execute();
	}

	executeCustomAction(document: TextDocument, nameElement: NamedElement, edit?: WorkspaceEdit) {
		this.quickAction.show();
	}

	register() {
		return Disposable.from(
			registerCodeSuggestionProvider(this),
			registerCodeLensProvider(this),
			registerQuickFixProvider(this),
			registerAutoDevProviders(this),
			registerRenameAction(this),
		);
	}

	run() {
		// Show notifications
		this.contextState.requestAccessUserCodebasePermission({});
	}
}
