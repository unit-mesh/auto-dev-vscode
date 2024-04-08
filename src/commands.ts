import * as vscode from "vscode";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeAction } from "./action/ide-action";

enum AutoDevCommand {}

const commandsMap: (
  sidebar: AutoDevWebviewViewProvider,
  action: IdeAction
) => {
  [command: string]: (...args: any) => any;
} = (sidebar, action) => ({
  "continue.quickFix": async (message: string, code: string, edit: boolean) => {
    sidebar.webviewProtocol?.request("newSessionWithPrompt", {
      prompt: `${
        edit ? "/edit " : ""
      }${code}\n\nHow do I fix this problem in the above code?: ${message}`,
    });

    if (!edit) {
      vscode.commands.executeCommand("autodev.autodevGUIView.focus");
    }
  },
  "continue.debugTerminal": async () => {
    vscode.commands.executeCommand("autodev.autodevGUIView.focus");
    const terminalContents = await action.getTerminalContents();
    sidebar.webviewProtocol?.request("userInput", {
      input: `I got the following error, can you please help explain how to fix it?\n\n${terminalContents.trim()}`,
    });
  },
});

export function registerCommands(
  context: vscode.ExtensionContext,
  sidebar: AutoDevWebviewViewProvider,
  action: IdeAction
) {
  const commands = commandsMap(sidebar, action);
  Object.entries(commands).forEach(([command, handler]) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, handler)
    );
  });
}
