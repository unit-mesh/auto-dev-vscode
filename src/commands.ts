import * as vscode from "vscode";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeAction } from "./action/ide-action";
import { AutoDevContext } from "./autodev-context";
import { IdentifierBlockRange } from "./document/IdentifierBlockRange";
import { selectCodeInRange } from "./commands/editor";

enum AutoDevCommand {}

const commandsMap: (
  sidebar: AutoDevWebviewViewProvider,
  action: IdeAction
) => {
  [command: string]: (...args: any) => any;
} = (sidebar, action) => ({
  "autodev.quickFix": async (message: string, code: string, edit: boolean) => {
    sidebar.webviewProtocol?.request("newSessionWithPrompt", {
      prompt: `${
        edit ? "/edit " : ""
      }${code}\n\nHow do I fix this problem in the above code?: ${message}`,
    });

    if (!edit) {
      vscode.commands.executeCommand("autodev.autodevGUIView.focus");
    }
  },

  "autodev.sendToTerminal": (text: string) => {
    action.runCommand(text);
  },
  "autodev.debugTerminal": async () => {
    vscode.commands.executeCommand("autodev.autodevGUIView.focus");
    const terminalContents = await action.getTerminalContents();
    sidebar.webviewProtocol?.request("userInput", {
      input: `I got the following error, can you please help explain how to fix it?\n\n${terminalContents.trim()}`,
    });
  },
  "autodev.generateDoc": async (
    document: vscode.TextDocument,
    range: IdentifierBlockRange,
    edit: vscode.WorkspaceEdit
  ) => {
    const doc = generateDocumentation(document.getText());
    selectCodeInRange(range.blockRange.start, range.blockRange.end);

    // edit.insert(document.uri, range.blockRange.start, doc);
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit((editBuilder) => {
        editBuilder.insert(range.blockRange.start, doc);
      });
    }
  },
});

export function registerCommands(context: AutoDevContext) {
  const commands = commandsMap(context.sidebar, context.action);
  Object.entries(commands).forEach(([command, handler]) => {
    context.vscContext.subscriptions.push(
      vscode.commands.registerCommand(command, handler)
    );
  });
}

function generateDocumentation(code: string): string {
  return `
/**
   * This function/method does something.
   * @param {string} param1 Description of parameter 1.
   * @returns {number} Description of the return value.
   */
`;
}
