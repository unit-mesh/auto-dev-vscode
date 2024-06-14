import { parse } from 'csv-parse';
import fs from 'fs';
import { inject, injectable } from 'inversify';
import path from 'path';
import vscode from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';

import { Service } from '../service/Service';
import { TeamTerm } from './TeamTerm';

@injectable()
export class TeamTermService implements Service {
	terms: TeamTerm[] = [];

	constructor(
		@inject(ConfigurationService)
		private configService: ConfigurationService,
	) {}

	fetch(): TeamTerm[] {
		if (this.terms.length) {
			return this.terms;
		}

		let teamTerms = this.from();
		this.terms = teamTerms;
		return teamTerms;
	}

	from(paths: string = 'team_terms.csv'): TeamTerm[] {
		const workspace = vscode.workspace.workspaceFolders?.[0];
		if (!workspace) {
			throw new Error('No workspace found');
		}

		let promptsDir = this.configService.get<string>('customPromptDir', 'prompts');
		const csvPath = path.join(workspace.uri.fsPath, promptsDir, paths);

		if (!fs.existsSync(csvPath)) {
			console.info('No team terms file found');
			return [];
		}

		const file = fs.createReadStream(csvPath);

		const parser = parse({
			delimiter: ',',
			columns: true,
			skip_empty_lines: true,
		});

		file.pipe(parser);

		const terms: TeamTerm[] = [];

		parser.on('readable', function () {
			let record;
			while ((record = parser.read())) {
				terms.push({
					id: record.id,
					term: record.term,
					localized: record.localized,
				});
			}
		});

		parser.on('error', function (err: any) {
			console.info(err.message);
		});

		parser.on('end', function () {
			console.info('Parsing finished successfully');
		});

		return terms;
	}
}
