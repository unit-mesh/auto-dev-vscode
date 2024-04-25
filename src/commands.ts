import * as vscode from "vscode";
import { AutoDevExtension } from "./AutoDevExtension";
import { NamedElement } from "./editor/ast/NamedElement";

import { channel } from "./channel";
import { PlantUMLPresenter } from "./editor/codemodel/presenter/PlantUMLPresenter";
import { AutoDocActionExecutor } from "./editor/action/autodoc/AutoDocActionExecutor";
import { AutoTestActionExecutor } from "./editor/action/autotest/AutoTestActionExecutor";
import { NamedElementBuilder } from "./editor/ast/NamedElementBuilder";
import { QuickActionService } from "./editor/editor-api/QuickAction";
import { TeamPromptsBuilder } from "./prompt-manage/team-prompts/TeamPromptsBuilder";

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
  "autodev.autodevGUIView": async () => {},
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
  "autodev.autoComment": async (
    document: vscode.TextDocument,
    range: NamedElement,
    edit: vscode.WorkspaceEdit
  ) => {
    await new AutoDocActionExecutor(document, range, edit).execute();
  },
  "autodev.autoTest": async (
    document: vscode.TextDocument,
    range: NamedElement,
    edit: vscode.WorkspaceEdit
  ) => {
    await new AutoTestActionExecutor(document, range, edit).execute();
  },
  "autodev.explain": async (
    document: vscode.TextDocument,
    range: NamedElement,
  ) => {
  },
  "autodev.fixThis": async (
    document: vscode.TextDocument,
    range: NamedElement,
  ) => {
  },
  "autodev.menu.autoComment": async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    let edit = new vscode.WorkspaceEdit();
    let document = editor.document;
    //
    let elementBuilder = await NamedElementBuilder.from(document);
    let currentLine = editor.selection.active.line;
    let ranges = elementBuilder.getElementForAction(currentLine);

    if (ranges.length === 0) {
      return;
    }

    await new AutoDocActionExecutor(document, ranges[0], edit).execute();
  },
  "autodev.terminal.explainTerminalSelectionContextMenu": async () => {
  },
  "autodev.action.quickAction": async (
    document: vscode.TextDocument,
    range: NamedElement,
    edit: vscode.WorkspaceEdit
  ) => {
    let quickActionService = QuickActionService.instance();
    await quickActionService.show(extension);
  },
  "autodev.git.generateCommitMessage": async () => {
    // vscode.extensions.getExtension('vscode.git')?.exports.getAPI(1).repositories[0].inputBox.value = newvalue;
  },
  "autodev.git.generateCommitMessage": async () => {

  },
  "autodev.genApiData": async (
    document: vscode.TextDocument,
    range: NamedElement,
    edit: vscode.WorkspaceEdit
  ) => {
    let structurer = extension.structureProvider?.getStructurer(document.languageId);
    if (!structurer) {
      vscode.window.showErrorMessage("No structurer provider found for this language");
      return;
    }

    const file = await structurer.parseFile(document.getText(), document.uri.path);
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
