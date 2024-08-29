/* eslint-disable @typescript-eslint/naming-convention */
import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { createNamedElement } from 'src/code-context/ast/TreeSitterWrapper';
import { setTimeout } from 'timers/promises';
import {
	CancellationToken,
	CancellationTokenSource,
	commands,
	Disposable,
	env,
	l10n,
	Position,
	QuickPickItem,
	Range,
	Uri,
	window,
	WorkspaceEdit,
} from 'vscode';

import {
	CMD_CODEASPACE_ANALYSIS,
	CMD_CODEASPACE_KEYWORDS_ANALYSIS,
	CMD_CODEBASE_INDEXING,
	CMD_CODEBASE_RETRIEVAL,
	CMD_CREATE_UNIT_TEST,
	CMD_EXPLAIN_CODE,
	CMD_FEEDBACK,
	CMD_FIX_THIS,
	CMD_GEN_CODE_METHOD_COMPLETIONS,
	CMD_GEN_DOCSTRING,
	CMD_GIT_MESSAGE_COMMIT_GENERATE,
	CMD_NEW_CHAT_SESSION,
	CMD_OPEN_SETTINGS,
	CMD_OPTIMIZE_CODE,
	CMD_QUICK_CHAT,
	CMD_QUICK_FIX,
	CMD_SHOW_CHAT_HISTORY,
	CMD_SHOW_CHAT_PANEL,
	CMD_SHOW_SYSTEM_ACTION,
	CMD_SHOW_TUTORIAL,
	CMD_TERMINAL_DEBUG,
	CMD_TERMINAL_EXPLAIN_SELECTION_CONTEXT_MENU,
	CMD_TERMINAL_SEND_TO,
} from 'base/common/configuration/configuration';
import { IExtensionContext } from 'base/common/configuration/context';
import { getGitExtensionAPI } from 'base/common/git';
import { logger } from 'base/common/log/log';
import { showErrorMessage } from 'base/common/messages/messages';

import { CommitMessageGenAction } from '../action/devops/CommitMessageGenAction';
import { SystemActionType } from '../action/setting/SystemActionType';
import { AutoDevExtension } from '../AutoDevExtension';
import { TextRange } from '../code-search/scope-graph/model/TextRange';
import { addHighlightedCodeToContext, getInput, showTutorial } from './commandsUtils';

@injectable()
export class CommandsService {
	constructor(
		@inject(IExtensionContext)
		private context: IExtensionContext,

		@inject(AutoDevExtension)
		private autodev: AutoDevExtension,
	) {}

	openSettins() {
		commands.executeCommand('workbench.action.openSettings', {
			query: `@ext:${this.context.extension.id}`,
		});
	}

	feedback() {
		env.openExternal(Uri.parse('https://github.com/unit-mesh/auto-dev-vscode/issues'));
	}

	showSystemAction() {
		this.autodev.systemAction.show();
	}

	async showChatPanel() {
		this.autodev.showChatPanel();
	}

	async quickChat() {
		const chat = this.autodev.chat;
		await chat.show();

		const editor = window.activeTextEditor;
		if (!editor) {
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			await chat.send('focusAutoDevInput', undefined);
			return;
		}

		await addHighlightedCodeToContext(editor, selection, chat);
	}
	newChatSession(prompt?: string) {
		this.autodev.newChatSession(prompt);
	}

	showChatHistory() {
		this.autodev.chat.send('viewHistory');
	}

	async explainCode() {
		const chat = this.autodev.chat;

		const editor = window.activeTextEditor;
		if (!editor) {
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			return;
		}

		await chat.show();

		await addHighlightedCodeToContext(editor, selection, chat);

		await setTimeout(800);
		await chat.input(l10n.t('Explain this code'));
	}

	async optimizeCode() {
		const chat = this.autodev.chat;

		const editor = window.activeTextEditor;
		if (!editor) {
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			return;
		}

		await chat.show();

		await addHighlightedCodeToContext(editor, selection, chat);

		await setTimeout(800);
		await chat.input(l10n.t('Optimize the code'));
	}

	async quickFix(message: string, code: string, edit: boolean) {
		const chat = this.autodev.chat;

		const editor = window.activeTextEditor;
		const language = editor?.document?.languageId;

		await chat.show();

		await setTimeout(600);
		await chat.input(
			`${edit ? '/edit ' : ''}${code}\n\n${l10n.t('How do I fix this problem in the above code?')}:
		\`\`\`${language}
		${message}
		\`\`\`
		`,
		);
	}

	async fixThis() {
		const input = getInput();
		if (!input) {
			return;
		}

		const chat = this.autodev.chat;

		await chat.show();

		await setTimeout(800);
		chat.input(`${l10n.t('I got the following error, can you please help explain how to fix it?')}: ${input}`);
	}

	async generateMethod() {
		const editor = window.activeTextEditor;
		if (!editor) {
			return;
		}

		try {
			const document = editor.document;
			const edit = new WorkspaceEdit();
			const elementBuilder = await createNamedElement(this.autodev.treeSitterFileManager, document);
			const currentLine = editor.selection.active.line;
			const ranges = elementBuilder.getElementForAction(currentLine);

			if (ranges.length === 0) {
				return;
			}

			await this.autodev.executeAutoMethodAction(document, ranges[0], edit);
		} catch (error) {
			logger.error(`Commands error`, error);
			showErrorMessage('Command Call Error');
		}
	}

	async generateDocstring() {
		const editor = window.activeTextEditor;
		if (!editor) {
			return;
		}

		try {
			const document = editor.document;
			const edit = new WorkspaceEdit();
			const elementBuilder = await createNamedElement(this.autodev.treeSitterFileManager, document);
			const currentLine = editor.selection.active.line;
			const ranges = elementBuilder.getElementForAction(currentLine);

			if (ranges.length === 0) {
				return;
			}

			await this.autodev.executeAutoDocAction(document, ranges[0], edit);
		} catch (error) {
			logger.error(`Commands error`, error);
			showErrorMessage('Command Call Error');
		}
	}

	async generateUnitTest() {
		const editor = window.activeTextEditor;
		if (!editor) {
			return;
		}

		try {
			const document = editor.document;
			const elementBuilder = await createNamedElement(this.autodev.treeSitterFileManager, document);

			const selectionStart: number = editor?.selection.start.line ?? 0;
			const selectionEnd: number = editor?.selection.end.line ?? document.lineCount;
			const ranges = elementBuilder.getElementForSelection(selectionStart, selectionEnd);

			if (ranges.length === 0) {
				return;
			}

			await this.autodev.executeAutoTestAction(document, ranges[0], new WorkspaceEdit());
		} catch (error) {
			logger.error(`Commands error`, error);
			showErrorMessage('Command Call Error');
		}
	}

	startCodebaseIndexing() {
		this.autodev.createCodebaseIndex();
	}

	showCodebasePanel() {
		const input = window.createQuickPick<CodebaseResultItem>();

		input.title = 'Codebase Retrieval';
		input.placeholder = 'Enter keywords to retrieve codebase from';
		input.ignoreFocusOut = true;

		input.show();

		let cancellation: CancellationTokenSource | undefined;

		const retrievalCode = async (value: string, token: CancellationToken) => {
			input.busy = true;

			try {
				const result = await this.autodev.retrievalCode(
					value,
					{
						withFullTextSearch: true,
						withSemanticSearch: true,
					},
					token,
				);

				if (token.isCancellationRequested) {
					return;
				}

				input.busy = true;

				input.items = result.map(item => {
					return {
						label: item.name,
						description: item.content.slice(0, 128),
						path: item.path,
						range: item.range,
					};
				});
			} catch (err) {
				showErrorMessage('Error: ' + (err as Error).message);
			} finally {
				input.busy = false;
			}
		};

		input.onDidChangeValue(
			_.debounce((value: string) => {
				cancellation?.cancel();
				cancellation = new CancellationTokenSource();
				retrievalCode(value, cancellation.token);
			}, 500),
		);

		input.onDidChangeSelection(items => {
			const item = items[0];

			window.showTextDocument(Uri.file(item.path), {
				selection: new Range(
					new Position(item.range.start.line, item.range.start.column),
					new Position(item.range.end.line, item.range.end.column),
				),
			});

			input.hide();
		});

		input.onDidHide(() => {
			cancellation?.cancel();
			input.dispose();
		});
	}

	async generateCommitMessage() {
		const api = getGitExtensionAPI();

		if (api) {
			const repo = api.repositories[0];
			await new CommitMessageGenAction(this.autodev).handleDiff(repo.inputBox);
		}
	}

	showTutorial() {
		showTutorial(this.context.extensionUri);
	}

	codespaceCodeAnalysis(input: string) {
		return this.autodev.catalyser.query(input, SystemActionType.SemanticSearchCode);
	}

	codespaceKeywordsAnalysis(input: string) {
		return this.autodev.catalyser.query(input, SystemActionType.SemanticSearchKeyword);
	}

	async explainTerminalSelectionContextMenu() {
		try {
			const terminalContents = await this.autodev.ideAction.getTerminalContents(1);

			await this.autodev.chat.show();

			await setTimeout(600);
			await this.autodev.chat.input(
				`${l10n.t('I got the following error, can you please help explain how to fix it?')}\n\n${terminalContents.trim()}`,
			);
		} catch (e) {
			logger.error((e as Error).message);
		}
	}

	terminalSendTo(text: string) {
		this.autodev.ideAction.runCommand(text).catch(error => {
			window.showErrorMessage((error as Error).message);
		});
	}

	async terminalDebug() {
		const terminalContents = await this.autodev.ideAction.getTerminalContents(1);

		await setTimeout(600);
		await this.autodev.chat.input(
			`${l10n.t('I got the following error, can you please help explain how to fix it?')}\n\n${terminalContents.trim()}`,
		);
	}

	register() {
		// TODO Migration GenApiData
		return Disposable.from(
			// General Commands
			commands.registerCommand(CMD_OPEN_SETTINGS, this.openSettins, this),
			commands.registerCommand(CMD_SHOW_TUTORIAL, this.showTutorial, this),
			commands.registerCommand(CMD_FEEDBACK, this.feedback, this),
			commands.registerCommand(CMD_SHOW_SYSTEM_ACTION, this.showSystemAction, this),
			// Chat Commands
			commands.registerCommand(CMD_SHOW_CHAT_PANEL, this.showChatPanel, this),
			commands.registerCommand(CMD_QUICK_CHAT, this.quickChat, this),
			commands.registerCommand(CMD_NEW_CHAT_SESSION, this.newChatSession, this),
			commands.registerCommand(CMD_SHOW_CHAT_HISTORY, this.showChatHistory, this),
			// ContextMenu Commands
			commands.registerCommand(CMD_EXPLAIN_CODE, this.explainCode, this),
			commands.registerCommand(CMD_OPTIMIZE_CODE, this.optimizeCode, this),
			commands.registerCommand(CMD_FIX_THIS, this.fixThis, this),
			commands.registerCommand(CMD_QUICK_FIX, this.quickFix, this),
			commands.registerCommand(CMD_GEN_DOCSTRING, this.generateDocstring, this),
			commands.registerCommand(CMD_GEN_CODE_METHOD_COMPLETIONS, this.generateMethod, this),
			commands.registerCommand(CMD_CREATE_UNIT_TEST, this.generateUnitTest, this),
			// Codebase Commands
			commands.registerCommand(CMD_CODEBASE_INDEXING, this.startCodebaseIndexing, this),
			commands.registerCommand(CMD_CODEBASE_RETRIEVAL, this.showCodebasePanel, this),
			// Chat Slash Commands
			commands.registerCommand(CMD_CODEASPACE_ANALYSIS, this.codespaceCodeAnalysis, this),
			commands.registerCommand(CMD_CODEASPACE_KEYWORDS_ANALYSIS, this.codespaceKeywordsAnalysis, this),
			//Terminal Commands
			commands.registerCommand(
				CMD_TERMINAL_EXPLAIN_SELECTION_CONTEXT_MENU,
				this.explainTerminalSelectionContextMenu,
				this,
			),
			commands.registerCommand(CMD_TERMINAL_SEND_TO, this.terminalSendTo, this),
			commands.registerCommand(CMD_TERMINAL_DEBUG, this.terminalDebug, this),
			// Other Commands
			commands.registerCommand(CMD_GIT_MESSAGE_COMMIT_GENERATE, this.generateCommitMessage, this),
		);
	}
}

interface CodebaseResultItem extends QuickPickItem {
	path: string;
	range: TextRange;
}
