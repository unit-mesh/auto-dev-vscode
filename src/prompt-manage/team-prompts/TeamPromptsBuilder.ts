import * as vscode from 'vscode';
import * as fs from 'fs';
import { CustomActionPrompt } from './CustomActionPrompt';
import { TeamPromptAction } from "./TeamPromptAction";

class TeamPromptsBuilder {
	private project: vscode.WorkspaceFolder;
	private settings: any;
	private baseDir: string;

	constructor(project: vscode.WorkspaceFolder) {
		this.project = project;
		this.settings = vscode.workspace.getConfiguration('prompts', this.project.uri);
		this.baseDir = this.settings.get('prompts') || '';
	}

	default(): TeamPromptAction[] {
		const promptsDir = fs.readdirSync(vscode.workspace.rootPath + '/' + this.baseDir);
		const filterPrompts = promptsDir.filter(file => file.endsWith('.vm'));

		return this.buildPrompts(filterPrompts);
	}

	quickPrompts(): TeamPromptAction[] {
		const quickPromptDir = vscode.workspace.rootPath + '/' + this.baseDir + '/quick';
		if (!fs.existsSync(quickPromptDir)) return [];

		const quickPromptFiles = fs.readdirSync(quickPromptDir).filter(file => file.endsWith('.vm'));

		return this.buildPrompts(quickPromptFiles);
	}

	flows(): string[] {
		const promptDir = vscode.workspace.rootPath + '/' + this.baseDir + '/flows';
		if (!fs.existsSync(promptDir)) return [];

		return fs.readdirSync(promptDir).filter(file => file.endsWith('.devin'));
	}

	private buildPrompts(prompts: string[]): TeamPromptAction[] {
		return prompts.map(filename => {
			const promptName = filename.replace(/-/g, ' ').split('.')[0];
			const promptContent = fs.readFileSync(vscode.workspace.rootPath + '/' + this.baseDir + '/' + filename, 'utf-8');
			const actionPrompt = CustomActionPrompt.fromContent(promptContent);

			return { actionName: promptName, actionPrompt };
		});
	}

	overrideTemplate(pathPrefix: string, filename: string): string | null {
		const path = `${this.baseDir}/${pathPrefix}/${filename}`;
		const overrideFilePath = vscode.workspace.rootPath + '/' + path;

		if (!fs.existsSync(overrideFilePath)) return null;

		return fs.readFileSync(overrideFilePath, 'utf-8');
	}
}

