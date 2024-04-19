import path from "path";
import fs from "fs";
import vscode, { WorkspaceFolder } from "vscode";

export class TestTemplateFinder {
	private workspace: WorkspaceFolder | undefined;

	constructor() {
		this.workspace = vscode.workspace.workspaceFolders?.[0];
	}

	/**
	 * Looks up a template file by its name and returns its content as a string.
	 *
	 * @param templateFileName the name of the template file to look up
	 * @return the content of the template file as a string, or null if the file is not found
	 *
	 * 1. Find the prompts directory
	 */
	lookup(templateFileName: string): string | null {
		const promptsDir = this.workspace?.uri.with({ path: path.join(this.workspace.uri.path, "prompts") });
		if (!promptsDir) return null;

		const templateFile = promptsDir.with({ path: path.join(promptsDir.path, "templates") });
		if (!templateFile) return null;

		const templateFilePath = path.join(templateFile.fsPath, templateFileName);
		if (fs.existsSync(templateFilePath)) {
			return fs.readFileSync(templateFilePath, { encoding: 'utf-8' });
		}

		const vmTemplateFilePath = path.join(templateFile.fsPath, `${templateFileName}.vm`);
		if (fs.existsSync(vmTemplateFilePath)) {
			return fs.readFileSync(vmTemplateFilePath, { encoding: 'utf-8' });
		}

		const files = fs.readdirSync(templateFile.fsPath);
		const endSuffixFile = files.find(file => file.endsWith(templateFileName));
		if (endSuffixFile) {
			const endSuffixFilePath = path.join(templateFile.fsPath, endSuffixFile);
			return fs.readFileSync(endSuffixFilePath, { encoding: 'utf-8' });
		}

		return null;
	}
}
