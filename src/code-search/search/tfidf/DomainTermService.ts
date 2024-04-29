import vscode from "vscode";
import path from "path";
import fs from "fs";

export class DomainTermService {
	loadCsv() {
		const workspace = vscode.workspace.workspaceFolders?.[0];
		if (!workspace) {
			throw new Error('No workspace found');
		}

		const csvPath = path.join(workspace.uri.fsPath, 'data', 'domain_terms.csv');

		const csv = fs.readFileSync(csvPath, 'utf8');

		const lines = csv.split('\n');

		const domainTerms = new Map();
		for (const line of lines) {
			const [domain, terms] = line.split(',');
			domainTerms.set(domain, terms.split(' '));
		}

		return domainTerms;
	}
}