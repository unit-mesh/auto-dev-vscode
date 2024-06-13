import { inject, injectable } from 'inversify';
// eslint-disable-next-line @typescript-eslint/naming-convention
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
	TextDocument,
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
	CMD_FIX_CODE,
	CMD_GEN_DOCSTRING,
	CMD_GIT_MESSAGE_COMMIT_GENERATE,
	CMD_NEW_CHAT_SESSION,
	CMD_OPEN_SETTINGS,
	CMD_OPTIMIZE_CODE,
	CMD_SHOW_CHAT_HISTORY,
	CMD_SHOW_CHAT_PANEL,
	CMD_SHOW_QUICK_ACTION,
	CMD_SHOW_SYSTEM_ACTION,
	CMD_SHOW_TUTORIAL,
} from 'base/common/configuration/configuration';
import { IExtensionContext } from 'base/common/configuration/context';
import { getGitExtensionAPI } from 'base/common/git';
import { logger } from 'base/common/log/log';
import { showErrorMessage } from 'base/common/messages/messages';

import { CommitMessageGenAction } from '../action/devops/CommitMessageGenAction';
import { SystemActionType } from '../action/setting/SystemActionType';
import { AutoDevExtension } from '../AutoDevExtension';
import { TextRange } from '../code-search/scope-graph/model/TextRange';
import { NamedElement } from '../editor/ast/NamedElement';
import { addHighlightedCodeToContext, getUserSelectedCode, showTutorial } from './commandsUtils';

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

	showQuickAction(document: TextDocument, nameElement: NamedElement) {
		const autodev = this.autodev;
		const customPrompts = autodev.teamPromptsBuilder.teamPrompts();

		const items = [
			// {
			// 	label: l10n.t('Explain Code'),
			// 	execute: () => {
			// 		// pass
			// 	},
			// },
			// {
			// 	label: l10n.t('Optimize Code'),
			// 	execute: () => {
			// 		// pass
			// 	},
			// },
			// {
			// 	label: l10n.t('Fix Code'),
			// 	execute: () => {
			// 		// pass
			// 	},
			// },
			{
				label: l10n.t('AutoComment'),
				execute: () => {
					this.autodev.executeAutoDocAction(document, nameElement);
				},
			},
			{
				label: l10n.t('AutoTest'),
				execute: () => {
					this.autodev.executeAutoTestAction(document, nameElement);
				},
			},
		];

		if (customPrompts.length > 0) {
			items.push({
				label: l10n.t('Custom Action'),
				execute: () => {
					this.autodev.executeCustomAction(document, nameElement);
				},
			});
		}

		const quickPick = window.createQuickPick<{
			label: string;
			execute: () => void;
		}>();

		quickPick.items = items;

		quickPick.onDidChangeSelection(async selection => {
			const [item] = selection;

			quickPick.hide();
			item?.execute();
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}

	showChatPanel() {
		this.autodev.showChatPanel();
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

		// TODO hack message render empty
		await setTimeout(800);
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

		// TODO hack message render empty
		await setTimeout(800);
		await addHighlightedCodeToContext(editor, selection, chat);

		await setTimeout(800);
		await chat.input(l10n.t('Please optimize the following function:'));
	}

	async fixCode() {
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

		await setTimeout(800);
		await addHighlightedCodeToContext(editor, selection, chat);

		await setTimeout(800);
		await chat.input(l10n.t('How do I fix this problem in the above code?'));
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

			await this.autodev.executeAutoTestAction(document, ranges[0]);
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
		this.autodev.catalyser.query(input, SystemActionType.SemanticSearchKeyword);
	}

	codespaceKeywordsAnalysis(input: string) {
		this.autodev.catalyser.query(input, SystemActionType.SemanticSearchCode);
	}

	register() {
		return Disposable.from(
			// General Commands
			commands.registerCommand(CMD_OPEN_SETTINGS, this.openSettins, this),
			commands.registerCommand(CMD_SHOW_TUTORIAL, this.showTutorial, this),
			commands.registerCommand(CMD_FEEDBACK, this.feedback, this),
			// AutoDev Commands
			commands.registerCommand(CMD_SHOW_SYSTEM_ACTION, this.showSystemAction, this),
			commands.registerCommand(CMD_SHOW_QUICK_ACTION, this.showQuickAction, this),
			// Chat Commands
			commands.registerCommand(CMD_SHOW_CHAT_PANEL, this.showChatPanel, this),
			commands.registerCommand(CMD_NEW_CHAT_SESSION, this.newChatSession, this),
			commands.registerCommand(CMD_SHOW_CHAT_HISTORY, this.showChatHistory, this),
			// ContextMenu Commands
			commands.registerCommand(CMD_EXPLAIN_CODE, this.explainCode, this),
			commands.registerCommand(CMD_OPTIMIZE_CODE, this.optimizeCode, this),
			commands.registerCommand(CMD_FIX_CODE, this.fixCode, this),
			commands.registerCommand(CMD_GEN_DOCSTRING, this.generateDocstring, this),
			commands.registerCommand(CMD_CREATE_UNIT_TEST, this.generateUnitTest, this),
			// Codebase Commands
			commands.registerCommand(CMD_CODEBASE_INDEXING, this.startCodebaseIndexing, this),
			commands.registerCommand(CMD_CODEBASE_RETRIEVAL, this.showCodebasePanel, this),
			commands.registerCommand(CMD_CODEASPACE_ANALYSIS, this.codespaceCodeAnalysis, this),
			commands.registerCommand(CMD_CODEASPACE_KEYWORDS_ANALYSIS, this.codespaceKeywordsAnalysis, this),
			// Other Commands
			commands.registerCommand(CMD_GIT_MESSAGE_COMMIT_GENERATE, this.generateCommitMessage, this),
		);
	}
}

interface CodebaseResultItem extends QuickPickItem {
	path: string;
	range: TextRange;
}
