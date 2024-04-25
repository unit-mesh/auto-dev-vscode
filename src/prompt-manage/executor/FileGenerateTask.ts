import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ChatMessage, ChatRole } from "../../llm-provider/ChatMessage";
import { LlmProvider } from "../../llm-provider/LlmProvider";
import { MarkdownCodeBlock } from "../../markdown/MarkdownCodeBlock";

export class FileGenerateTask {
	constructor(
		private readonly project: vscode.WorkspaceFolder,
		private readonly messages: ChatMessage[],
		private readonly fileName: string | undefined = undefined
	) {
	}

	public async run() {
		const stream = LlmProvider.instance()._streamChat(this.messages);

		let result = '';
		for await (const chunk of stream) {
			result += chunk;
		}

		const inferFileName =
			this.fileName === undefined
				? 'output-' + Date.now() + (MarkdownCodeBlock.parse(result).language === '' ? '.txt' : '.' + MarkdownCodeBlock.parse(result).language)
				: this.fileName;

		const filePath = path.resolve(this.project.uri.fsPath, inferFileName);
		await fs.promises.writeFile(filePath, result);

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
