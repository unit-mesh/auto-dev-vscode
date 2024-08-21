/* eslint-disable curly */
import { setTimeout } from 'node:timers/promises';

import { convertToErrorMessage, TreeSitterFile } from 'src/code-context/ast/TreeSitterFile';
import { NamedElement } from 'src/editor/ast/NamedElement';
import { NamedElementBuilder } from 'src/editor/ast/NamedElementBuilder';
import { TreeSitterFileManager } from 'src/editor/cache/TreeSitterFileManager';
import { ChatViewService } from 'src/editor/views/chat/chatViewService';
import {
	CancellationToken,
	CodeLens,
	CodeLensProvider,
	Command,
	commands,
	Disposable,
	l10n,
	TextDocument,
	window,
	WorkspaceEdit,
} from 'vscode';

import {
	CMD_CODELENS_CREATE_UNIT_TEST,
	CMD_CODELENS_EXPLAIN_CODE,
	CMD_CODELENS_GEN_DOCSTRING,
	CMD_CODELENS_OPTIMIZE_CODE,
	CMD_CODELENS_QUICK_CHAT,
	CMD_CODELENS_SHOW_CUSTOM_ACTION,
	CMD_SHOW_CODELENS_DETAIL_QUICKPICK,
} from 'base/common/configuration/configuration';
import { ConfigurationService } from 'base/common/configuration/configurationService';
import { isFileTooLarge } from 'base/common/files/files';
import { isSupportedLanguage } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';
import { logger } from 'base/common/log/log';

import { type AutoDevExtension } from '../../AutoDevExtension';

type CodeLensItemType = 'quickChat' | 'explainCode' | 'optimizeCode' | 'autoComment' | 'autoTest' | 'customAction';

export class AutoDevCodeLensProvider implements CodeLensProvider {
	private config: ConfigurationService;
	private lsp: ILanguageServiceProvider;
	private fileManager: TreeSitterFileManager;

	private disposables: Disposable[];

	constructor(private autodev: AutoDevExtension) {
		this.config = autodev.config;
		this.lsp = autodev.lsp;
		this.fileManager = autodev.treeSitterFileManager;

		const chat = autodev.chat;

		this.disposables = [
			commands.registerCommand(CMD_SHOW_CODELENS_DETAIL_QUICKPICK, (items: Command[]) => {
				const quickPick = window.createQuickPick<{
					label: string;
					description: string | undefined;
					command: string;
					arguments: unknown[] | undefined;
				}>();

				quickPick.items = items.map(cmd => {
					return {
						label: cmd.title,
						command: cmd.command,
						description: cmd.tooltip,
						arguments: cmd.arguments,
					};
				});

				quickPick.onDidChangeSelection(async selection => {
					const [item] = selection;
					quickPick.hide();

					const args = item.arguments || [];
					commands.executeCommand(item.command, ...args);
				});

				quickPick.onDidHide(() => quickPick.dispose());
				quickPick.show();
			}),
			commands.registerCommand(CMD_CODELENS_QUICK_CHAT, async (document: TextDocument, nameElement: NamedElement) => {
				await chat.show();

				// TODO hack message render empty
				await setTimeout(600);
				await sendHighlightedCodeToChat(chat, document, nameElement);
			}),
			commands.registerCommand(CMD_CODELENS_EXPLAIN_CODE, async (document: TextDocument, nameElement: NamedElement) => {
				await chat.show();

				// TODO hack message render empty
				await setTimeout(600);
				await sendHighlightedCodeToChat(chat, document, nameElement);

				await setTimeout(800);
				await chat.input(l10n.t('Explain this code'));
			}),
			commands.registerCommand(
				CMD_CODELENS_OPTIMIZE_CODE,
				async (document: TextDocument, nameElement: NamedElement) => {
					await chat.show();

					// TODO hack message render empty
					await setTimeout(600);
					await sendHighlightedCodeToChat(chat, document, nameElement);

					await setTimeout(800);
					await chat.input(l10n.t('Optimize the code'));
				},
			),
			commands.registerCommand(CMD_CODELENS_GEN_DOCSTRING, (document: TextDocument, nameElement: NamedElement) => {
				autodev.executeAutoDocAction(document, nameElement);
			}),
			commands.registerCommand(
				CMD_CODELENS_CREATE_UNIT_TEST,
				(document: TextDocument, nameElement: NamedElement, edit: WorkspaceEdit) => {
					autodev.executeAutoTestAction(document, nameElement, edit);
				},
			),
			commands.registerCommand(CMD_CODELENS_SHOW_CUSTOM_ACTION, (document: TextDocument, nameElement: NamedElement) => {
				autodev.executeCustomAction(document, nameElement);
			}),
		];
	}

	dispose() {
		return Disposable.from(...this.disposables);
	}

	isMinimizedIcon() {
		return this.config.get<string>('codelensDisplayMode') === 'collapse';
	}

	getDisplayCodelensItems() {
		return new Set(this.config.get<CodeLensItemType[]>('codelensDislayItems'));
	}

	hasCustomPromps() {
		return this.autodev.teamPromptsBuilder.teamPrompts().length > 0;
	}

	async provideCodeLenses(document: TextDocument, token: CancellationToken) {
		if (isFileTooLarge(document) || !isSupportedLanguage(document.languageId)) {
			return [];
		}

		const displayItems = this.getDisplayCodelensItems();
		if (displayItems.size === 0) {
			return [];
		}

		const elements = await this.parseToNamedElements(document);
// elements为空导致codelens组没有数据，无法生成codelens

		if (token.isCancellationRequested || elements.length === 0) {
			return [];
		}

		const groups = this.buildCodeLensGroups(displayItems, elements, document, token);
		if (groups.length === 0) {
			return [];
		}

		if (this.isMinimizedIcon()) {
			return groups.map(codelenses => this.buildQuickPickCodeLens(codelenses));
		}

		return groups.flat();
	}

	private buildQuickPickCodeLens(codelenses: CodeLens[]): CodeLens {
		const [head] = codelenses;

		const items = codelenses.map(codelens => codelens.command!);

		return new CodeLens(head.range, {
			title: '$(autodev-icon)$(chevron-down)',
			command: CMD_SHOW_CODELENS_DETAIL_QUICKPICK,
			arguments: [items],
		});
	}

	private buildCodeLensGroups(
		displaySet: Set<CodeLensItemType>,
		elements: NamedElement[],
		document: TextDocument,
		token: CancellationToken,
	) {
		const result: CodeLens[][] = [];
		const hasCustomPromps = this.hasCustomPromps();

		for (const element of elements) {
			const codelenses: CodeLens[] = [];

			for (const type of displaySet) {
				if (type === 'quickChat') {
					codelenses.push(
						new CodeLens(element.identifierRange, {
							title: l10n.t('Quick Chat'),
							command: CMD_CODELENS_QUICK_CHAT,
							arguments: [document, element],
						}),
					);
					continue;
				}

				if (type === 'explainCode') {
					codelenses.push(
						new CodeLens(element.identifierRange, {
							title: l10n.t('Explain Code'),
							command: CMD_CODELENS_EXPLAIN_CODE,
							arguments: [document, element],
						}),
					);
					continue;
				}
				if (type === 'optimizeCode') {
					codelenses.push(
						new CodeLens(element.identifierRange, {
							title: l10n.t('Optimize Code'),
							command: CMD_CODELENS_OPTIMIZE_CODE,
							arguments: [document, element],
						}),
					);
					continue;
				}

				if (type === 'autoComment') {
					codelenses.push(
						new CodeLens(element.identifierRange, {
							title: l10n.t('AutoComment'),
							command: CMD_CODELENS_GEN_DOCSTRING,
							arguments: [document, element],
						}),
					);
					continue;
				}

				if (type === 'autoTest') {
					if (!element.isTestFile()) {
						codelenses.push(
							new CodeLens(element.identifierRange, {
								title: l10n.t('AutoTest'),
								command: CMD_CODELENS_CREATE_UNIT_TEST,
								arguments: [document, element, new WorkspaceEdit()],
							}),
						);
					}
					continue;
				}

				if (type === 'customAction') {
					if (hasCustomPromps) {
						codelenses.push(
							new CodeLens(element.identifierRange, {
								title: l10n.t('Custom Action'),
								command: CMD_CODELENS_SHOW_CUSTOM_ACTION,
								arguments: [document, element],
							}),
						);
					}
					continue;
				}
			}

			result.push(codelenses);
		}

		return result;
	}

	private async parseToNamedElements(document: TextDocument) {
		const builder = await this.createFileElementBuilder(document);
		if (builder) {
			return [...builder.buildClass(), ...builder.buildMethod()];
		}

		return [];
	}

	private async createFileElementBuilder(document: TextDocument) {
		try {
			// todo: for a simple file, we can just don't use cache, since we update algorithm is not correct
			if (document.lineCount > 256) {
				const content = document.getText();

				return new NamedElementBuilder(
					await TreeSitterFile.create(content, document.languageId, this.lsp, document.uri.fsPath),
				);
			}

			return new NamedElementBuilder(await this.fileManager.create(document));
		} catch (e) {
			if (typeof e === 'number') {
				logger.debug('(codelens): parse error:', convertToErrorMessage(e));
			} else if (e instanceof Error) {
				logger.debug('(codelens): error', e);
			} else {
				logger.debug('(codelens): Unkown error', e);
			}
		}
	}
}

async function sendHighlightedCodeToChat(chat: ChatViewService, document: TextDocument, nameElement: NamedElement) {
	const { blockRange } = nameElement;

	const rangeInFileWithContents = {
		filepath: document.uri.fsPath,
		contents: nameElement.blockContent,
		range: {
			start: {
				line: blockRange.start.line,
				character: blockRange.start.character,
			},
			end: {
				line: blockRange.end.line,
				character: blockRange.end.character,
			},
		},
	};

	await chat.send('highlightedCode', {
		rangeInFileWithContents,
	});
}
