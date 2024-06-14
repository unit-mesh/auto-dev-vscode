import fs from 'node:fs';
import path from 'node:path';

import { workspace, type WorkspaceFolder } from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';
import { logger } from 'base/common/log/log';

import { CustomActionPrompt } from '../custom-action/CustomActionPrompt';
import { TeamPromptAction } from './TeamPromptAction';

export class TeamPromptsBuilder {
	private baseDir: string;
	private rootDir: WorkspaceFolder | null;

	constructor(configService: ConfigurationService) {
		this.baseDir = configService.get<string>('customPromptDir')!;
		this.rootDir = workspace.workspaceFolders ? workspace.workspaceFolders[0] : null;
	}

	/**
	 * Retrieves a list of team prompts from the specified directory.
	 *
	 * @returns An array of team prompt actions.
	 */
	teamPrompts(): TeamPromptAction[] {
		const rootDir = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.fsPath : null;
		if (!rootDir) {
			return [];
		}

		const promptsDir = path.join(rootDir, this.baseDir);
		return this.buildPrompts(promptsDir);
	}

	/**
	 * Retrieves a list of TeamPromptAction objects from the 'quick' directory within the base directory.
	 * If the 'quick' directory does not exist, an empty array is returned.
	 * The 'quick' directory should contain files with the '.vm' extension, which will be filtered and used to build the prompts.
	 * @returns {TeamPromptAction[]} An array of TeamPromptAction objects.
	 */
	quickPrompts(): TeamPromptAction[] {
		const quickPromptDir = this.rootDir + '/' + this.baseDir + '/quick';
		if (!fs.existsSync(quickPromptDir)) {
			return [];
		}

		return this.buildPrompts(quickPromptDir);
	}

	/**
	 * Retrieves the list of available flow files from the `flows` directory.
	 *
	 * @returns An array of flow file names.
	 */
	devinFlow(): string[] {
		const promptDir = this.rootDir + '/' + this.baseDir + '/flows';
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
		const overrideFilePath = this.rootDir + '/' + path;

		if (!fs.existsSync(overrideFilePath)) {
			return null;
		}

		return fs.readFileSync(overrideFilePath, 'utf-8');
	}

	private buildPrompts(promptsDir: string) {
		const prompts: TeamPromptAction[] = [];

		try {
			const files = fs.readdirSync(promptsDir);

			const vmFiles = files.filter(file => file.endsWith('.vm'));

			vmFiles.forEach(file => {
				const filePath = path.join(promptsDir, file);
				// the action name will be the file name without the extension， and remove slice
				let actionName = file.split('.').slice(0, -1).join('.').replaceAll('-', ' ');

				const fileContent = fs.readFileSync(filePath, 'utf-8');
				let actionPrompt = CustomActionPrompt.fromContent(fileContent);
				if (!actionPrompt) {
					return;
				}

				// check name is in the prompt
				if (actionPrompt.name) {
					actionName = actionPrompt.name;
				}

				const teamPromptAction: TeamPromptAction = {
					actionName: actionName,
					actionPrompt: actionPrompt,
				};

				prompts.push(teamPromptAction);
			});
		} catch (error) {
			// ignore error
			// logger.append('Error reading prompts: ' + error + '\n');
		}

		return prompts;
	}
}
