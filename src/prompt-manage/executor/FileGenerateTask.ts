import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { MarkdownCodeBlock } from "../../markdown/MarkdownCodeBlock";

export class FileGenerateTask {
	constructor(
		private readonly project: vscode.WorkspaceFolder,
		private readonly outputText: string,
		private readonly fileName: string | undefined = undefined
	) {
	}

	public async run() {
		let parsedCode = MarkdownCodeBlock.parse(this.outputText);
		const inferFileName =
			this.fileName === undefined
				? 'output-' + Date.now() + (parsedCode.language === '' ? '.txt' : '.' + parsedCode.language)
				: this.fileName;

		const filePath = path.resolve(this.project.uri.fsPath, inferFileName);
		await fs.promises.writeFile(filePath, this.outputText);

		await this.refreshAndOpenInEditor(filePath);
	}

	private async refreshAndOpenInEditor(filePath: string) {
		try {
			const doc = await vscode.workspace.openTextDocument(filePath);
			await vscode.window.showTextDocument(doc);
		} catch (error) {
			console.error('Error opening file:', error);
		}
	}
}
