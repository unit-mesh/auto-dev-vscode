import * as vscode from 'vscode';

import { CMD_SHOW_QUICK_ACTION } from 'base/common/configuration/configuration';
import { SUPPORTED_LANGUAGES } from 'base/common/languages/languages';
import { logger } from 'base/common/log/log';

import { AutoDevExtension } from '../../AutoDevExtension';
import { convertToErrorMessage, TreeSitterFile, TreeSitterFileError } from '../../code-context/ast/TreeSitterFile';
import { NamedElement } from '../../editor/ast/NamedElement';
import { NamedElementBuilder } from '../../editor/ast/NamedElementBuilder';
import { TreeSitterFileManager } from '../../editor/cache/TreeSitterFileManager';

export class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
	private _eventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	onDidChangeCodeLenses: vscode.Event<void> = this._eventEmitter.event;

	private onDidChangeTextDocument: vscode.Disposable;

	private treeSitterFileManager: TreeSitterFileManager;

	constructor(private readonly autodev: AutoDevExtension) {
		this.treeSitterFileManager = autodev.treeSitterFileManager;

		this.onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(async event => {
			if (SUPPORTED_LANGUAGES.includes(event.document.languageId)) {
				this.refresh();
			}
		});
	}

	dispose() {
		this._eventEmitter.dispose();
		this.onDidChangeTextDocument.dispose();
	}

	public refresh(): void {
		this._eventEmitter.fire();
	}

	async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
		const languageId = document.languageId;
		if (!SUPPORTED_LANGUAGES.includes(languageId)) {
			return [];
		}

		try {
			let tsfile: TreeSitterFile;
			/// todo: for a simple file, we can just don't use cache, since we update algorithm is not correct
			if (document.lineCount > 256) {
				const src = document.getText();
				const langId = document.languageId;
				tsfile = await TreeSitterFile.create(src, langId, this.autodev.lsp, document.uri.fsPath);
			} else {
				tsfile = await this.treeSitterFileManager.create(document);
			}

			let tsFileElementBuilder = new NamedElementBuilder(tsfile);
			return this.buildForLens(tsFileElementBuilder, document);
		} catch (e) {
			if (typeof e === 'number') {
				logger.debug('(codelens): parse error:', convertToErrorMessage(e));
			} else if (e instanceof Error) {
				logger.debug('(codelens): error', e);
			} else {
				logger.debug('(codelens): Unkown error', e);
			}
		}

		return [];
	}

	private buildForLens(builder: NamedElementBuilder, document: vscode.TextDocument) {
		const classRanges: NamedElement[] | TreeSitterFileError = builder.buildClass();
		const methodRanges: NamedElement[] | TreeSitterFileError = builder.buildMethod();

		const elements = classRanges.concat(methodRanges);
		const chatLens = this.setupQuickChat(elements, document);

		// move to AutoDevExtenstion#showQuickAction?
		// const testLens = this.setupTestCodeLen(elements, document);
		// return ([] as vscode.CodeLens[]).concat(testLens, chatLens);

		return chatLens;
	}

	// private setupTestCodeLen(methodRanges: NamedElement[], document: vscode.TextDocument): vscode.CodeLens[] {
	// 	return methodRanges
	// 		.map(namedElement => {
	// 			if (namedElement.isTestFile()) {
	// 				return;
	// 			}

	// 			const title = l10n.t('AutoTest');
	// 			return new vscode.CodeLens(namedElement.identifierRange, {
	// 				title,
	// 				command: 'autodev.autoTest',
	// 				arguments: [document, namedElement, new vscode.WorkspaceEdit()],
	// 			});
	// 		})
	// 		.filter((lens): lens is vscode.CodeLens => !!lens);
	// }

	private setupQuickChat(methodRanges: NamedElement[], document: vscode.TextDocument): vscode.CodeLens[] {
		return methodRanges.map(range => {
			const title = `$(autodev-icon)$(chevron-down)`;
			return new vscode.CodeLens(range.identifierRange, {
				title,
				command: CMD_SHOW_QUICK_ACTION,
				arguments: [document, range],
			});
		});
	}
}
