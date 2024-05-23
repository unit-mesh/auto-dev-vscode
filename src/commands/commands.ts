import * as vscode from "vscode";

import { AutoDevExtension } from "../AutoDevExtension";
import { NamedElement } from "../editor/ast/NamedElement";
import { channel } from "../channel";
import { AutoDocActionExecutor } from "../action/autodoc/AutoDocActionExecutor";
import { AutoTestActionExecutor } from "../action/autotest/AutoTestActionExecutor";
import { NamedElementBuilder } from "../editor/ast/NamedElementBuilder";
import { QuickActionService } from "../editor/editor-api/QuickAction";
import { SystemActionService } from "../action/setting/SystemActionService";
import { createNamedElement } from "../code-context/ast/TreeSitterWrapper";
import { AutoDevCommandOperation } from "./autoDevCommandOperation";
import { AutoDevCommand } from "./autoDevCommand";
import { DefaultLanguageService } from "../editor/language/service/DefaultLanguageService";
import { CommitMessageGenAction } from "../action/devops/CommitMessageGenAction";
import { RelevantCodeProviderManager } from "../code-context/RelevantCodeProviderManager";
import { TreeSitterFileManager } from "../editor/cache/TreeSitterFileManager";
import { AutoDevWebviewProtocol } from "../editor/webview/AutoDevWebviewProtocol";
import path from "path";
import fs from "fs";
import { getExtensionUri } from "../context";

const commandsMap: (extension: AutoDevExtension) => AutoDevCommandOperation = (extension) => ({
	[AutoDevCommand.QuickFix]: async (message: string, code: string, edit: boolean) => {
		extension.sidebar.webviewProtocol?.request("newSessionWithPrompt", {
			prompt: `${
				edit ? "/edit " : ""
			}${code}\n\nHow do I fix this problem in the above code?: ${message}`,
		});

		if (!edit) {
			vscode.commands.executeCommand("autodev.autodevGUIView.focus");
		}
	},
	[AutoDevCommand.SendToTerminal]: async (text: string) => {
		extension.ideAction.runCommand(text).then(() => {
		}, (err) => vscode.window.showErrorMessage(err.message));
	},
	[AutoDevCommand.DebugTerminal]: async () => {
		vscode.commands.executeCommand("autodev.autodevGUIView.focus");
		const terminalContents = await extension.ideAction.getTerminalContents(1);
		extension.sidebar.webviewProtocol?.request("newSessionWithPrompt", {
			input: `I got the following error, can you please help explain how to fix it?\n\n${terminalContents.trim()}`,
		});
	},
	[AutoDevCommand.AutoComment]: async (
		document: vscode.TextDocument,
		range: NamedElement,
		edit: vscode.WorkspaceEdit
	) => {
		await new AutoDocActionExecutor(document, range, edit).execute();
	},
	[AutoDevCommand.AutoTest]: async (
		// in context menu, the first argument is not the document
		document?: vscode.TextDocument,
		element?: NamedElement,
		edit?: vscode.WorkspaceEdit
	) => {
		const editor = vscode.window.activeTextEditor;
		const textDocument = editor?.document;
		if (!textDocument) {
			return;
		}

		let elementBuilder: NamedElementBuilder | null = null;
		await createNamedElement(textDocument).then((builder) => {
			elementBuilder = builder;
		}).catch((err) => {
			channel.appendLine(`Error: ${err}`);
		});

		if (elementBuilder === null) {
			return;
		}

		const selectionStart: number = editor?.selection.start.line ?? 0;
		const selectionEnd: number = editor?.selection.end.line ?? textDocument.lineCount;

		const nameElement = element || (elementBuilder as NamedElementBuilder)!!.getElementForSelection(selectionStart, selectionEnd)?.[0];
		if (!nameElement) {
			return;
		}

		const workspaceEdit = edit || new vscode.WorkspaceEdit();
		await new AutoTestActionExecutor(textDocument, nameElement, workspaceEdit).execute();
	},
	[AutoDevCommand.ExplainThis]: async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		let selection: string = editor.document.getText(editor.selection);

		let document = editor.document;
		let input;

		if (selection.length > 0) {
			input = selection;
		} else {
			input = document.getText();
		}

		vscode.commands.executeCommand("autodev.autodevGUIView.focus");
		extension.sidebar.webviewProtocol?.request("newSessionWithPrompt", { prompt: `Explain this: 
${input}` });
	},
	[AutoDevCommand.FixThis]: async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		let selection: string = editor.document.getText(editor.selection);

		let document = editor.document;
		let input;

		if (selection.length > 0) {
			input = selection;
		} else {
			input = document.getText();
		}

		extension.sidebar.webviewProtocol?.request("newSessionWithPrompt", {
			prompt: `How do I fix this problem in the above code?: ${input}`,
		});
	},
	[AutoDevCommand.MenuAutoComment]: async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		let edit = new vscode.WorkspaceEdit();
		let document = editor.document;
		//
		let elementBuilder = await createNamedElement(document);
		let currentLine = editor.selection.active.line;
		let ranges = elementBuilder.getElementForAction(currentLine);

		if (ranges.length === 0) {
			return;
		}

		await new AutoDocActionExecutor(document, ranges[0], edit).execute();
	},
	[AutoDevCommand.TerminalExplainContextMenu]: async () => {
		//
	},
	[AutoDevCommand.ActionQuickAction]: async (
		document: vscode.TextDocument,
		range: NamedElement,
		edit: vscode.WorkspaceEdit
	) => {
		let quickActionService = QuickActionService.instance();
		await quickActionService.show(extension);
	},
	[AutoDevCommand.SystemAction]: async (
		document: vscode.TextDocument,
		range: NamedElement,
		edit: vscode.WorkspaceEdit
	) => {
		await SystemActionService.instance().show(extension);
	},
	[AutoDevCommand.GenerateCommitMessage]: async () => {
		let activate = await vscode.extensions.getExtension('vscode.git');
		activate?.activate()?.then(async (gitExtension) => {
			const gitAPI = gitExtension.getAPI(1);
			const repo = gitAPI.repositories[0];
			await new CommitMessageGenAction().handleDiff(repo.inputBox);
		});
	},
	[AutoDevCommand.GenApiData]: async (
		document: vscode.TextDocument,
		range: NamedElement,
		edit: vscode.WorkspaceEdit
	) => {
		let structurer = extension.structureProvider?.getStructurer(document.languageId);
		if (!structurer) {
			vscode.window.showErrorMessage("No structurer provider found for this language");
			return;
		}

		let langService = new DefaultLanguageService();
		let relatedProvider = RelevantCodeProviderManager.getInstance().provider(document.languageId, langService);
		let file = await TreeSitterFileManager.create(document);

		let outputs = await relatedProvider?.getMethodFanInAndFanOut(file, range);
		if (outputs !== undefined) {
			outputs.map((output) => {
				channel.append(`current outputs: ${JSON.stringify(output)}\n`);
			});
		}
	},
	[AutoDevCommand.GUIFocusInput]: async () => {
		if (!getFullScreenTab()) {
			vscode.commands.executeCommand("autodev.autodevGUIView.focus");
		}
		extension.sidebar.webviewProtocol?.request("focusAutoDevInput", undefined);
		await addHighlightedCodeToContext(false, extension.sidebar.webviewProtocol);
	},
	[AutoDevCommand.NewSession]: () => {
		extension.sidebar.webviewProtocol?.request("newSession", undefined);
	},
	[AutoDevCommand.ShowTutorial]: () => {
		showTutorial();
	},
});

export async function showTutorial() {
	const tutorialPath = path.join(
		getExtensionUri().fsPath,
		"autodev_tutorial.py",
	);
	// Ensure keyboard shortcuts match OS
	if (process.platform !== "darwin") {
		let tutorialContent = fs.readFileSync(tutorialPath, "utf8");
		tutorialContent = tutorialContent.replace("⌘", "^").replace("Cmd", "Ctrl");
		fs.writeFileSync(tutorialPath, tutorialContent);
	}

	const doc = await vscode.workspace.openTextDocument(
		vscode.Uri.file(tutorialPath),
	);
	await vscode.window.showTextDocument(doc, { preview: false });
}


async function addHighlightedCodeToContext(
	edit: boolean,
	webviewProtocol: AutoDevWebviewProtocol | undefined,
) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const selection = editor.selection;
		if (selection.isEmpty) return;
		const range = new vscode.Range(selection.start, selection.end);
		const contents = editor.document.getText(range);
		const rangeInFileWithContents = {
			filepath: editor.document.uri.fsPath,
			contents,
			range: {
				start: {
					line: selection.start.line,
					character: selection.start.character,
				},
				end: {
					line: selection.end.line,
					character: selection.end.character,
				},
			},
		};

		webviewProtocol?.request("highlightedCode", {
			rangeInFileWithContents,
		});
	}
}

function getFullScreenTab() {
	const tabs = vscode.window.tabGroups.all.flatMap((tabGroup) => tabGroup.tabs);
	return tabs.find(
		(tab) => (tab.input as any)?.viewType?.endsWith("continue.continueGUIView"),
	);
}


export function registerCommands(extension: AutoDevExtension) {
	const commands = commandsMap(extension);
	Object.entries(commands).forEach(([command, handler]) => {
		extension.extensionContext.subscriptions.push(
			vscode.commands.registerCommand(command, handler)
		);
	});
}
