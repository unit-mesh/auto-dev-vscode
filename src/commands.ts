import * as vscode from "vscode";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeAction } from "./action/ide-action";
import { AutoDevContext } from "./autodev-context";
import { IdentifierBlockRange } from "./document/IdentifierBlockRange";

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
    edit.insert(document.uri, range.blockRange.start, doc);

    selectCodeInRange(range.blockRange.start, range.blockRange.end);
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

function selectCodeInRange(start: vscode.Position, end: vscode.Position) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const newSelection = new vscode.Selection(start, end);
    editor.selection = newSelection;
    editor.revealRange(newSelection);
  }
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
