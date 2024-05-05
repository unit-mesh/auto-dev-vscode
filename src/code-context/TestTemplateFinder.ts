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
		let promptsDir = path.join(this.workspace?.uri.fsPath || "", "prompts");
		if (!fs.existsSync(promptsDir)) {return null;}

		let templateFile = path.join(promptsDir, "templates");
		if (!fs.existsSync(templateFile)) {return null;}

		const templateFilePath = path.join(templateFile, templateFileName);
		if (fs.existsSync(templateFilePath)) {
			return fs.readFileSync(templateFilePath, { encoding: 'utf-8' });
		}

		const vmTemplateFilePath = path.join(templateFile, `${templateFileName}.vm`);
		if (fs.existsSync(vmTemplateFilePath)) {
			return fs.readFileSync(vmTemplateFilePath, { encoding: 'utf-8' });
		}

		const files = fs.readdirSync(templateFile);
		const endSuffixFile = files.find(file => file.endsWith(templateFileName));
		if (endSuffixFile) {
			const endSuffixFilePath = path.join(templateFile, endSuffixFile);
			return fs.readFileSync(endSuffixFilePath, { encoding: 'utf-8' });
		}

		return null;
	}
}
