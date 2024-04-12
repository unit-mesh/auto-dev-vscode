import * as vscode from "vscode";
import { AutoDevExtension } from "./AutoDevExtension";
import { IdentifierBlockRange } from "./document/IdentifierBlockRange";
import { insertCodeByRange, selectCodeInRange } from "./commands/editor";
import { DefaultLanguageService } from "./language/service/DefaultLanguageService";

import { channel } from "./channel";

const commandsMap: (
  extention: AutoDevExtension
) => {
  [command: string]: (...args: any) => any;
} = (ext) => ({
  "autodev.quickFix": async (message: string, code: string, edit: boolean) => {
    ext.sidebar.webviewProtocol?.request("newSessionWithPrompt", {
      prompt: `${
        edit ? "/edit " : ""
      }${code}\n\nHow do I fix this problem in the above code?: ${message}`,
    });

    if (!edit) {
      vscode.commands.executeCommand("autodev.autodevGUIView.focus");
    }
  },

  "autodev.sendToTerminal": (text: string) => {
    ext.action.runCommand(text).then(
      () => {},
      (err) => vscode.window.showErrorMessage(err.message)
    );
  },
  "autodev.debugTerminal": async () => {
    vscode.commands.executeCommand("autodev.autodevGUIView.focus");
    const terminalContents = await ext.action.getTerminalContents();
    ext.sidebar.webviewProtocol?.request("userInput", {
      input: `I got the following error, can you please help explain how to fix it?\n\n${terminalContents.trim()}`,
    });
  },
  "autodev.generateDoc": async (
    document: vscode.TextDocument,
    range: IdentifierBlockRange,
    edit: vscode.WorkspaceEdit
  ) => {
    const doc: string = generateDocumentation(document.getText());
    selectCodeInRange(range.blockRange.start, range.blockRange.end);
    insertCodeByRange(range.blockRange.start, doc);
  },
  "autodev.genApiData": async (
    document: vscode.TextDocument,
    range: IdentifierBlockRange,
    edit: vscode.WorkspaceEdit
  ) => {
    let structurer = ext.getStructureProvider()?.getStructurer(document.languageId);
    if (!structurer) {
      vscode.window.showErrorMessage("No structurer provider found for this language");
      return;
    }

    await structurer.init(new DefaultLanguageService());
    const file = await structurer.parseFile(document.getText());
    channel.append("CodeFile: " + JSON.stringify(file));
  }
});

export function registerCommands(extension: AutoDevExtension) {
  const commands = commandsMap(extension);
  Object.entries(commands).forEach(([command, handler]) => {
    extension.extensionContext.subscriptions.push(
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
