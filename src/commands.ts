import * as vscode from "vscode";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";

enum AutoDevCommand {}

const commandsMap: (sidebar: AutoDevWebviewViewProvider) => {
  [command: string]: (...args: any) => any;
} = (sidebar) => ({
  "continue.quickFix": async (message: string, code: string, edit: boolean) => {
    sidebar.webviewProtocol?.request("newSessionWithPrompt", {
      prompt: `${
        edit ? "/edit " : ""
      }${code}\n\nHow do I fix this problem in the above code?: ${message}`,
    });

    if (!edit) {
      vscode.commands.executeCommand("continue.continueGUIView.focus");
    }
  },
  "continue.debugTerminal": async () => {
    // todo
  },
});

// todo: build command context
export function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("continue.debugTerminal", async () => {})
  );
}
