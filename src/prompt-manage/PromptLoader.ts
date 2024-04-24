import vscode from "vscode";
import { SettingService } from "../settings/SettingService";
import path from "path";
import { CustomActionPrompt } from "./team-prompts/CustomActionPrompt";

export class PromptLoader {
	private static _instance: PromptLoader;

	private constructor() {
	}

	public static getInstance(): PromptLoader {
		if (!PromptLoader._instance) {
			PromptLoader._instance = new PromptLoader();
		}
		return PromptLoader._instance;
	}

	/**
	 * Load all prompts from the project dir
	 */
	async loadPrompts(): Promise<CustomActionPrompt[]> {
		let customPromptsDir = SettingService.instance().customPromptsDir()

		// scan all files in the customPromptsDir
		let customPromptsFile: string[] = [];
		let results: CustomActionPrompt[] = [];

		await vscode.workspace.fs
			.readDirectory(vscode.Uri.file(customPromptsDir))
			.then((files) => {
				files.forEach((file) => {
					if (file[1] === vscode.FileType.File) {
						customPromptsFile.push(file[0]);
					}
				});
			})
			.then(() => {
				// Load each prompt file
				customPromptsFile.forEach(async (file) => {
					let promptPath = path.join(customPromptsDir, file);
					let promptContent = await vscode.workspace.fs.readFile(vscode.Uri.file(promptPath));

					// this.prompts.push(promptJson);
					let actionPrompt = CustomActionPrompt.fromContent(promptContent.toString());
					results.push(actionPrompt);
				});
			});

		return results;
	}
}
