import * as vscode from "vscode";
import { SUPPORTED_LANGID } from "../supported";

export class AutoDocumentationActionProvider
  implements vscode.CodeActionProvider
{
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const langId = document.languageId;

    // 获取用户选择的代码范围
    const selectedCode = document.getText(range);

    // 分析选中的代码，生成文档注释
    const documentation = this.generateDocumentation(selectedCode);

    // 创建修复建议
    const codeAction = new vscode.CodeAction(
      "Generate Documentation (AutoDev)",
      vscode.CodeActionKind.Empty
    );
    codeAction.edit = new vscode.WorkspaceEdit();
    codeAction.edit.insert(document.uri, range.end, "\n\n" + documentation); // 在代码后面插入生成的文档注释

    return [codeAction];
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
