import vscode from "vscode";
import path from "path";
import fs from "fs";
import { parse } from 'csv-parse';
import { injectable } from "inversify";

import { Service } from "../service/Service";
import { DomainTerm } from "./DomainTerm";

@injectable()
export class DomainTermService implements Service {
	from(paths: string = 'domain_terms.csv'): DomainTerm[] {
		const workspace = vscode.workspace.workspaceFolders?.[0];
		if (!workspace) {
			throw new Error('No workspace found');
		}

		const csvPath = path.join(workspace.uri.fsPath, paths);

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
			console.info(err.message);
		});

		parser.on('end', function () {
			console.info('Parsing finished successfully');
		});

		return terms;
	}
}