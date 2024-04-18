import * as vscode from "vscode";
import { AutoDevExtension } from "./AutoDevExtension";
import { IdentifierBlockRange } from "./editor/document/IdentifierBlockRange";
import { DefaultLanguageService } from "./editor/language/service/DefaultLanguageService";

import { channel } from "./channel";
import { PlantUMLPresenter } from "./editor/codemodel/presenter/PlantUMLPresenter";
import { showQuickPick } from "./editor/editor-api/QuickInput";
import { AutoDocAction } from "./editor/action/AutoDocAction";

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
    new AutoDocAction(document, range, edit).execute();
  },
  "autodev.explain": async () => {},
  "autodev.fixThis": async () => {},
  "autodev.generateTests": async () => {},
  "autodev.terminal.explainTerminalSelectionContextMenu": async () => {},
  "autodev.action.quickchat": async (
    document: vscode.TextDocument,
    range: IdentifierBlockRange,
    edit: vscode.WorkspaceEdit
  ) => {
    // const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
    //   showQuickPick: showQuickPick,
    //   showInputBox: showInputBox
    // };
    // const quickPick = window.createQuickPick();
    // quickPick.items = Object.keys(options).map(label => ({ label }));
    // quickPick.onDidChangeSelection(selection => {
    //   if (selection[0]) {
    //     options[selection[0].label](extension.extensionContext)
    //       .catch(console.error);
    //   }
    // });
    // quickPick.onDidHide(() => quickPick.dispose());
    // quickPick.show();
    showQuickPick();
  },
  "autodev.genApiData": async (
    document: vscode.TextDocument,
    range: IdentifierBlockRange,
    edit: vscode.WorkspaceEdit
  ) => {
    let structurer = extension.structureProvider?.getStructurer(document.languageId);
    if (!structurer) {
      vscode.window.showErrorMessage("No structurer provider found for this language");
      return;
    }

    await structurer.init(new DefaultLanguageService());
    const file = await structurer.parseFile(document.getText());
    if (file !== undefined) {
      const output = new PlantUMLPresenter().convert(file);

      let relatedProvider = extension.relatedManager.getRelatedProvider(document.languageId);

      channel.append(`current uml: ${output}`);

      // todo: replace method to really method
      let outputs = await relatedProvider?.inputOutputs(file, file.classes[0].methods[0]);
      if (outputs !== undefined) {
        outputs.map((output) => {
          channel.append(`current outputs: ${JSON.stringify(output)}\n`);
        });
      }
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
