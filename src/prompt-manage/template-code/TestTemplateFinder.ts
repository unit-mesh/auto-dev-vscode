import * as vscode from 'vscode';
import * as fs from 'fs';

class TestTemplateFinder {
	private project: vscode.WorkspaceFolder;

	constructor(project: vscode.WorkspaceFolder) {
		this.project = project;
	}

	lookup(templateFileName: string): string | null {
		const settings = vscode.workspace.getConfiguration('prompts', this.project.uri);
		const path = settings.get<string>('prompts') ?? 'prompts';

		const promptsDir = fs.readdirSync(vscode.workspace.rootPath + '/' + path);
		if (!promptsDir) {
			return null;
		}

		const templateFile = promptsDir.find((file: string) => file === 'templates');
		if (!templateFile) {
			return null;
		}

		const templatePath = vscode.workspace.rootPath + '/' + path + '/' + templateFile;
		const templateCode = fs.readdirSync(templatePath).find((file: string) => file === templateFileName);
		if (templateCode) {
			return fs.readFileSync(templatePath + '/' + templateCode, 'utf-8');
		}

		// Second lookup same name with .vm
		const vmTemplate = fs.readdirSync(templatePath).find((file: string) => file === `${templateFileName}.vm`);
		if (vmTemplate) {
			return fs.readFileSync(templatePath + '/' + vmTemplate, 'utf-8');
		}

		// Final search end with filename
		const endSuffix = fs.readdirSync(templatePath).find((file: string) => file.endsWith(templateFileName));
		if (endSuffix) {
			return fs.readFileSync(templatePath + '/' + endSuffix, 'utf-8');
		}

		return null;
	}
}
