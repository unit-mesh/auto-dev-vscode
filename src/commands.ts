import * as vscode from "vscode";
import { AutoDevExtension } from "./AutoDevExtension";
import { IdentifierBlockRange } from "./document/IdentifierBlockRange";
import { insertCodeByRange, selectCodeInRange } from "./commands/editor";
import { DefaultLanguageService } from "./language/service/DefaultLanguageService";

import { channel } from "./channel";
import { PlantUMLPresenter } from "./codemodel/presenter/PlantUMLPresenter";

const commandsMap: (
  extension: AutoDevExtension
) => {
  [command: string]: (...args: any) => any;
} = (extension) => ({
  "autodev.quickFix": async (message: string, code: string, edit: boolean) => {
    extension.sidebar.webviewProtocol?.request("newSessionWithPrompt", {
      prompt: `${
        edit ? "/edit " : ""
      }${code}\n\nHow do I fix this problem in the above code?: ${message}`,
    });

    if (!edit) {
      vscode.commands.executeCommand("autodev.autodevGUIView.focus");
    }
  },

  "autodev.sendToTerminal": (text: string) => {
    extension.action.runCommand(text).then(
      () => {},
      (err) => vscode.window.showErrorMessage(err.message)
    );
  },
  "autodev.debugTerminal": async () => {
    vscode.commands.executeCommand("autodev.autodevGUIView.focus");
    const terminalContents = await extension.action.getTerminalContents();
    extension.sidebar.webviewProtocol?.request("userInput", {
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
    let structurer = extension.getStructureProvider()?.getStructurer(document.languageId);
    if (!structurer) {
      vscode.window.showErrorMessage("No structurer provider found for this language");
      return;
    }

    // filter current method

    await structurer.init(new DefaultLanguageService());
    const file = await structurer.parseFile(document.getText());
    if (file !== undefined) {
      const output = new PlantUMLPresenter().convert(file);
      channel.append(`current uml: ${output}`);

      let relatedProvider = extension.getRelatedProviderManager().getRelatedProvider(document.languageId);
      channel.append(`relatedProvider: ${relatedProvider}\n`);
      // todo: replace method to really method
      let outputs = relatedProvider?.inputOutputs(file, file.classes[0].methods[0]);
      channel.append(`current outputs: ${outputs}\n`);
    }
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
