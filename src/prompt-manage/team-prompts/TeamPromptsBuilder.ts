import * as vscode from 'vscode';
import * as fs from 'fs';

import { CustomActionPrompt } from './CustomActionPrompt';
import { TeamPromptAction } from "./TeamPromptAction";
import { SettingService } from "../../settings/SettingService";

class TeamPromptsBuilder {
	private baseDir: string;
	private rootPath;

	constructor() {
		this.baseDir = SettingService.instance().customPromptsDir();
		this.rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
	}

	/**
	 * Retrieves a list of team prompts from the specified directory.
	 *
	 * @returns An array of team prompt actions.
	 */
	teamPrompts(): TeamPromptAction[] {
		const promptsDir = fs.readdirSync(this.rootPath + '/' + this.baseDir);
		const filterPrompts = promptsDir.filter(file => file.endsWith('.vm'));

		return this.buildPrompts(filterPrompts);
	}

	/**
	 * Retrieves a list of TeamPromptAction objects from the 'quick' directory within the base directory.
	 * If the 'quick' directory does not exist, an empty array is returned.
	 * The 'quick' directory should contain files with the '.vm' extension, which will be filtered and used to build the prompts.
	 * @returns {TeamPromptAction[]} An array of TeamPromptAction objects.
	 */
	quickPrompts(): TeamPromptAction[] {
		const quickPromptDir = this.rootPath + '/' + this.baseDir + '/quick';
		if (!fs.existsSync(quickPromptDir)) {
			return [];
		}

		const quickPromptFiles = fs.readdirSync(quickPromptDir).filter(file => file.endsWith('.vm'));

		return this.buildPrompts(quickPromptFiles);
	}

	/**
	 * Retrieves the list of available flow files from the `flows` directory.
	 *
	 * @returns An array of flow file names.
	 */
	devinFlow(): string[] {
		const promptDir = this.rootPath + '/' + this.baseDir + '/flows';
		if (!fs.existsSync(promptDir)) {
			return [];
		}

		return fs.readdirSync(promptDir).filter(file => file.endsWith('.devin'));
	}

	/**
	 * Reads a file from the override directory.
	 *
	 * @param pathPrefix The prefix of the path to the override directory.
	 * @param filename The name of the file to read.
	 *
	 * @returns The contents of the file, or `null` if the file does not exist.
	 */
	overrideTemplate(pathPrefix: string, filename: string): string | null {
		const path = `${this.baseDir}/${pathPrefix}/${filename}`;
		const overrideFilePath = this.rootPath + '/' + path;

		if (!fs.existsSync(overrideFilePath)) {
			return null;
		}

		return fs.readFileSync(overrideFilePath, 'utf-8');
	}

	private buildPrompts(prompts: string[]): TeamPromptAction[] {
		return prompts.map(filename => {
			const promptName = filename.replace(/-/g, ' ').split('.')[0];
			const promptContent = fs.readFileSync(this.rootPath + '/' + this.baseDir + '/' + filename, 'utf-8');
			const actionPrompt = CustomActionPrompt.fromContent(promptContent);

			return { actionName: promptName, actionPrompt };
		});
	}
}

