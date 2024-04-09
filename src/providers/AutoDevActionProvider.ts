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

  static readonly providedCodeActionKinds = [vscode.CodeActionKind.Refactor];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const lang = document.languageId;
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return [];
    }

    if (lang !== "java") {
      return [];
    }

    // todo: init all grammars here?
    const file = /** await */ TreeSitterFile.tryBuild(document.getText(), "java");
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
        const selectedCode = document.getText(blockRange);
        const documentation = this.generateDocumentation(selectedCode);
        const codeAction = new vscode.CodeAction(
          "Generate Documentation (AutoDev)",
          vscode.CodeActionKind.Empty
        );
        codeAction.edit = new vscode.WorkspaceEdit();
        codeAction.edit.insert(document.uri,blockRange.start,"\n\n" + documentation);

        actions.push(codeAction);
      }
    }

	console.log("actions", actions);
    return actions;
  }

  private static renderWithLsp(context: AutoDevContext) {
    const lsp = new JavaSemanticLsp(context);
    const client = lsp?.getLanguageClient();
    console.log(client);
  }

  private generateDocumentation(code: string): string {
    // 实现根据选中的代码生成文档注释的逻辑
    // 这里是一个示例，您可能需要根据您的语言和需求进行修改
    // 例如，您可以使用代码解析工具来分析代码结构并生成相应的文档注释
    return `/**
 * This function/method does something.
 * @param {string} param1 Description of parameter 1.
 * @returns {number} Description of the return value.
 */`;
  }
}
