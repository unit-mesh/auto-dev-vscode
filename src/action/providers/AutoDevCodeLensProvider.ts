/* eslint-disable curly */
import { setTimeout } from 'node:timers/promises';

import {
	FrameworkCodeFragment,
	FrameworkCodeFragmentExtractorBase,
} from 'src/code-context/_base/LanguageModel/ClassElement/FrameworkCodeFragmentExtractorBase';
import { ClassExtractorFactory } from 'src/code-context/_base/LanguageModel/ClassELementFactory/ClassExtarctorFactory';
import { convertToErrorMessage, TreeSitterFile } from 'src/code-context/ast/TreeSitterFile';
import { NamedElement } from 'src/editor/ast/NamedElement';
import { NamedElementBuilder } from 'src/editor/ast/NamedElementBuilder';
import { TreeSitterFileManager } from 'src/editor/cache/TreeSitterFileManager';
import { CodeElementType } from 'src/editor/codemodel/CodeElementType';
import { ChatViewService } from 'src/editor/views/chat/chatViewService';
import {
	CancellationToken,
	CodeLens,
	CodeLensProvider,
	Command,
	commands,
	Disposable,
	l10n,
	ProviderResult,
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
	CMD_CODELENS_SHOW_CODE_ADD_CODE_SAMPLE,
	CMD_CODELENS_SHOW_CODE_ADD_FRAMEWORK_CODE_FRAGMENT,
	CMD_CODELENS_SHOW_CODE_CLASS_COMPLETIONS,
	CMD_CODELENS_SHOW_CODE_METHOD_COMPLETIONS,
	CMD_CODELENS_SHOW_CODE_REMOVE_CODE_SAMPLE,
	CMD_CODELENS_SHOW_CODE_REMOVE_FRAMEWORK_CODE_FRAGMENT,
	CMD_CODELENS_SHOW_CUSTOM_ACTION,
	CMD_SHOW_CODELENS_DETAIL_QUICKPICK,
} from 'base/common/configuration/configuration';
import { ConfigurationService } from 'base/common/configuration/configurationService';
import { isFileTooLarge } from 'base/common/files/files';
import { isSupportedLanguage } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';
import { logger } from 'base/common/log/log';

import { type AutoDevExtension } from '../../AutoDevExtension';
import { AddCodeSampleExecutor, CodeSample } from '../addCodeSamples/AddCodeSampleExecutor';
import { AutoMethodActionExecutor } from '../autoMethod/AutoMethodActionExecutor';

type CodeLensItemType =
	| 'quickChat'
	| 'explainCode'
	| 'optimizeCode'
	| 'autoComment'
	| 'addCodeSample'
	| 'autoTest'
	| 'customAction'
	| 'AutoMethod'
	| 'AutoClass'
	| 'addFrameworkCodeFragment'
	| 'removeCodeSample'
	| 'removeFrameworkCodeFragment';

export class AutoDevCodeLensProvider implements CodeLensProvider {
	private config: ConfigurationService;
	private lsp: ILanguageServiceProvider;
	private fileManager: TreeSitterFileManager;
	private autoDev: AutoDevExtension;
	private disposables: Disposable[];

	constructor(private autodev: AutoDevExtension) {
		this.config = autodev.config;
		this.lsp = autodev.lsp;
		this.fileManager = autodev.treeSitterFileManager;

		const chat = autodev.chat;
		this.autoDev = autodev;
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
			commands.registerCommand(
				CMD_CODELENS_SHOW_CODE_METHOD_COMPLETIONS,
				(document: TextDocument, nameElement: NamedElement) => {
					autodev.executeAutoMethodAction(document, nameElement);
				},
			),
			commands.registerCommand(
				CMD_CODELENS_SHOW_CODE_CLASS_COMPLETIONS,
				(document: TextDocument, nameElement: NamedElement) => {
					autodev.executeAutoClassAction(document, nameElement);
				},
			),
			commands.registerCommand(
				CMD_CODELENS_SHOW_CODE_ADD_FRAMEWORK_CODE_FRAGMENT,
				(document: TextDocument, nameElement: NamedElement) => {
					autodev.executeAddFrameworkCodeFragmentAction(document, nameElement);
				},
			),
			commands.registerCommand(
				CMD_CODELENS_SHOW_CODE_ADD_CODE_SAMPLE,
				(document: TextDocument, nameElement: NamedElement) => {
					autodev.executeAddCodeSampleExecutorAction(document, nameElement);
				},
			),
			commands.registerCommand(
				CMD_CODELENS_SHOW_CODE_REMOVE_FRAMEWORK_CODE_FRAGMENT,
				(document: TextDocument, nameElement: NamedElement) => {
					autodev.executeRemoveFrameworkCodeFragmentAction(document, nameElement);
				},
			),
			commands.registerCommand(
				CMD_CODELENS_SHOW_CODE_REMOVE_CODE_SAMPLE,
				(document: TextDocument, nameElement: NamedElement) => {
					autodev.executeRemoveCodeSampleExecutorAction(document, nameElement);
				},
			),
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

		let groups = this.buildCodeLensGroups(displayItems, elements, document, token);
		if (groups.length === 0) {
			return [];
		}

		if (this.isMinimizedIcon()) {
			return groups.map(codelenses => this.buildQuickPickCodeLens(codelenses));
		}

		return groups.flat();
	}
	resolveCodeLens(codeLens: CodeLens): ProviderResult<CodeLens> {
		// 解析 CodeLens 的详细信息

		return codeLens;
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
		let result: CodeLens[][] = [];
		let hasCustomPromps = this.hasCustomPromps();

		for (let element of elements) {
			let codelenses: CodeLens[] = [];

			for (let type of displaySet) {
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
				if (type === 'AutoMethod') {
					if (
						element.codeElementType == CodeElementType.Method &&
						ClassExtractorFactory.IsSupportLanguage(document.languageId)
					) {
						codelenses.push(
							new CodeLens(element.identifierRange, {
								title: l10n.t('AutoMethod'),
								command: CMD_CODELENS_SHOW_CODE_METHOD_COMPLETIONS,
								arguments: [document, element],
							}),
						);
					}
					continue;
				}
				if (type === 'AutoClass') {
					if (
						element.codeElementType == CodeElementType.Structure &&
						ClassExtractorFactory.IsSupportLanguage(document.languageId)
					) {
						codelenses.push(
							new CodeLens(element.identifierRange, {
								title: l10n.t('AutoClass'),
								command: CMD_CODELENS_SHOW_CODE_CLASS_COMPLETIONS,
								arguments: [document, element],
							}),
						);
					}
				}
				if (type === 'addCodeSample') {
					if (
						(element.codeElementType != CodeElementType.Method &&
							element.codeElementType != CodeElementType.Structure) &&
						!AddCodeSampleExecutor.LanguageSupport.has(document.languageId)
					) {
					  continue;
					}
					let hasDataStorage = this.autoDev.workSpace.HasDataStorage(
						document.languageId,
						new CodeSample(element.node, document.uri.fsPath),
					);
					if (hasDataStorage == false) {
						codelenses.push(
							new CodeLens(element.identifierRange, {
								title: l10n.t('addCodeSample'),
								command: CMD_CODELENS_SHOW_CODE_ADD_CODE_SAMPLE,
								arguments: [document, element],
							}),
						);
					}
					continue;
				}
				if (type === 'removeCodeSample') {
					if (
						element.codeElementType != CodeElementType.Method &&
						element.codeElementType != CodeElementType.Structure&&
						!AddCodeSampleExecutor.LanguageSupport.has(document.languageId)
					) {
						continue;
					}
					let hasDataStorage = this.autoDev.workSpace.HasDataStorage(
						document.languageId,
						new CodeSample(element.node, document.uri.fsPath),
					);
					if (hasDataStorage == true) {
						codelenses.push(
							new CodeLens(element.identifierRange, {
								title: l10n.t('removeCodeSample'),
								command: CMD_CODELENS_SHOW_CODE_REMOVE_CODE_SAMPLE,
								arguments: [document, element],
							}),
						);
					}
					continue;
				}
				if (type === 'addFrameworkCodeFragment') {
					if (
						(element.codeElementType != CodeElementType.Method &&
						element.codeElementType != CodeElementType.Structure) ||
						!FrameworkCodeFragmentExtractorBase.LanguageSupport.has(document.languageId)
					) {
						continue;
					}
					let frameworkCodeFragment: FrameworkCodeFragment;
					switch (element.codeElementType) {
						case CodeElementType.Method:
							frameworkCodeFragment = new FrameworkCodeFragment(
								element.node,
								element.node.text,
								'',
								document.uri.fsPath,
								(doc: string) => {
									let match = /<summary>(.*?)<\/summary>/g;
									let matchResult = match.exec(doc);
									if (matchResult) {
										return matchResult[0];
									}
									return '';
								},
							);
							break;
						case CodeElementType.Structure:
							frameworkCodeFragment = new FrameworkCodeFragment(
								element.node,
								element.node.text,
								'',
								document.uri.fsPath,
							);
							break;
						default:
							continue;
					}
					let hasDataStorage = this.autoDev.workSpace.HasDataStorage(document.languageId, frameworkCodeFragment);
					if (hasDataStorage == false) {
						codelenses.push(
							new CodeLens(element.identifierRange, {
								title: l10n.t('addFrameworkCodeFragment'),
								command: CMD_CODELENS_SHOW_CODE_ADD_FRAMEWORK_CODE_FRAGMENT,
								arguments: [document, element],
							}),
						);
					}
					continue;
				}

				if (type === 'removeFrameworkCodeFragment') {
					if (
						(element.codeElementType != CodeElementType.Method &&
						element.codeElementType != CodeElementType.Structure) ||
						!FrameworkCodeFragmentExtractorBase.LanguageSupport.has(document.languageId)
					) {
						continue;
					}
					let frameworkCodeFragment: FrameworkCodeFragment ;
					switch (element.codeElementType) {
						case CodeElementType.Method:
							frameworkCodeFragment = new FrameworkCodeFragment(
								element.node,
								element.node.text,
								'',
								document.uri.fsPath,
								(doc: string) => {
									let match = /<summary>(.*?)<\/summary>/g;
									let matchResult = match.exec(doc);
									if (matchResult) {
										return matchResult[0];
									}
									return '';
								},
							);
							break;
						case CodeElementType.Structure:
							frameworkCodeFragment = new FrameworkCodeFragment(
								element.node,
								element.node.text,
								'',
								document.uri.fsPath,
							);
							break;
							default: continue;
					}
					let hasDataStorage = this.autoDev.workSpace.HasDataStorage(document.languageId, frameworkCodeFragment);
					if (hasDataStorage == true) {
						codelenses.push(
							new CodeLens(element.identifierRange, {
								title: l10n.t('removeFrameworkCodeFragment'),
								command: CMD_CODELENS_SHOW_CODE_REMOVE_FRAMEWORK_CODE_FRAGMENT,
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
