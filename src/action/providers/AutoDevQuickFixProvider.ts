import * as vscode from "vscode";
import { NamedElement } from "../../editor/ast/NamedElement";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";
import { TreeSitterFile } from "../../code-context/ast/TreeSitterFile";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";

export class AutoDevQuickFixProvider implements vscode.CodeActionProvider {
	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix,
	];

	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext,
		token: vscode.CancellationToken,
	): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
		return (async () => {
			if (context.diagnostics.length === 0) {
				return [];
			}

			let file = await TreeSitterFile.create(document.getText(), document.languageId, new DefaultLanguageService(), document.uri.fsPath);
			let namedElementBuilder = new NamedElementBuilder(file);
			let namedElement = namedElementBuilder.getElementForAction(range.start.line)[0];
			if (namedElement.isTestFile()) {
				return;
			}

			const createQuickFix = (edit: boolean) => {
				const diagnostic = context.diagnostics[0];
				const quickFix = new vscode.CodeAction(
					edit ? "Fix with AutoDev" : "Ask AutoDev",
					vscode.CodeActionKind.QuickFix,
				);
				quickFix.isPreferred = false;
				const surroundingRange = new vscode.Range(
					Math.max(0, range.start.line - 3),
					0,
					Math.min(document.lineCount, range.end.line + 3),
					0,
				);
				quickFix.command = {
					command: "autodev.quickFix",
					title: "AutoDev Quick Fix",
					arguments: [
						diagnostic.message,
						document.getText(surroundingRange),
						edit,
					],
				};
				return quickFix;
			};

			return [
				createQuickFix(false),
			];
		})();
	}
}


