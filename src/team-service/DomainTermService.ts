import vscode from "vscode";
import path from "path";
import fs from "fs";

import { parse } from 'csv-parse';

export interface DomainTerm {
	id?: string;
	// origin language, like Chinese
	localized: string;
	// english translation, like `function`
	// - `永远的神` will be `yyds`
	term: string;
}

export class DomainTermService {
	loadCsv(): DomainTerm[] {
		const workspace = vscode.workspace.workspaceFolders?.[0];
		if (!workspace) {
			throw new Error('No workspace found');
		}

		const csvPath = path.join(workspace.uri.fsPath, 'data', 'domain_terms.csv');

		const file = fs.createReadStream(csvPath);

		const parser = parse({
			delimiter: ',',
			columns: true,
			skip_empty_lines: true
		});

		file.pipe(parser);

		const terms: DomainTerm[] = [];

		parser.on('readable', function () {
			let record;
			while (record = parser.read()) {
				terms.push({
					term: record.term,
					localized: record.localized
				});
			}
		});

		parser.on('error', function (err) {
			console.error(err.message);
		});

		parser.on('end', function () {
			console.log('Parsing finished successfully');
		});

		return terms;
	}
}