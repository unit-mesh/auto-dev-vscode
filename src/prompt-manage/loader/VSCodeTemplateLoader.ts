import { Uri } from 'vscode';

import { TemplateLoader } from './TemplateLoader';

export class VSCodeTemplateLoader extends TemplateLoader {
	constructor(private extensionUri: Uri) {
		super();
	}

	async load(filepath: string): Promise<string> {
		if (!this.extensionUri) {
			throw new Error('Extension URI is not defined');
		}

		const templateUri = Uri.joinPath(this.extensionUri, filepath);
		return await this.readFile(templateUri.fsPath);
	}

	private async readFile(filepath: string): Promise<string> {
		const fs = require('fs');
		return new Promise((resolve, reject) =>
			fs.readFile(filepath, 'utf8', (err: any, data: any) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			}),
		);
	}
}
