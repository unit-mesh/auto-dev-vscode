import * as vscode from "vscode";
import { AutoDevContext } from "../autodev-context";
import { SUPPORTED_LANGUAGES } from "../language/supported";
import {
  TreeSitterFile,
  TreeSitterFileError,
} from "../semantic-treesitter/TreeSitterFile";
import { IdentifierBlockRange } from "../document/IdentifierBlockRange";
import { JavaSemanticLsp } from "../semantic-lsp/JavaSemanticLsp";

export class AutoDevActionProvider implements vscode.CodeActionProvider {
  private context: AutoDevContext;

  constructor(context: AutoDevContext) {
    this.context = context;
  }

  static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.RefactorRewrite,
  ];

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[] | null | undefined> {
    const lang = document.languageId;
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return [];
    }

    const file = await TreeSitterFile.tryBuild(document.getText(), lang);
    if (!(file instanceof TreeSitterFile)) {
      return;
    }

    const results: IdentifierBlockRange[] | TreeSitterFileError =
      file.methodRanges();
    if (!(results instanceof Array)) {
      return;
    }

    let actions: vscode.CodeAction[] = [];
    for (const result of results) {
      let blockRange = result.blockRange;
      // 获取用户选择的代码范围
      if (blockRange.contains(range)) {
        const codeAction = new vscode.CodeAction(
          `Generate doc for \`${result.identifierRange.text}\` (AutoDev)`,
          AutoDevActionProvider.providedCodeActionKinds[0]
        );

		codeAction.isPreferred = false;
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.command = {
			command: "autodev.generateDoc",
			title: `Generate doc for \`${result.identifierRange.text}\` (AutoDev)`,
			arguments: [document, result, codeAction.edit]
		};

        actions.push(codeAction);
      }
    }

    return actions;
  }

  private static renderWithLsp(context: AutoDevContext) {
    const lsp = new JavaSemanticLsp(context);
    const client = lsp?.getLanguageClient();
    console.log(client);
  }
}
