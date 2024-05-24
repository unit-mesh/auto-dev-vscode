import vscode from "vscode";
import path from "path";
import fs from "fs";
import { parse } from 'csv-parse';
import { injectable } from "inversify";

import { Service } from "../service/Service";
import { TeamTerm } from "./TeamTerm";
import { SettingService } from "../settings/SettingService";

@injectable()
export class TeamTermService implements Service {
	terms: TeamTerm[] = [];

	private static instance_: TeamTermService;

	static instance() {
		if (!this.instance_) {
			this.instance_ = new TeamTermService();
		}

		return this.instance_;
	}

	constructor() {
	}

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

		let promptsDir = SettingService.instance().customPromptsDir();
		const csvPath = path.join(workspace.uri.fsPath, promptsDir, paths);

		if (!fs.existsSync(csvPath)) {
			console.info('No team terms file found');
			return [];
		}

		const file = fs.createReadStream(csvPath);

		const parser = parse({
			delimiter: ',',
			columns: true,
			skip_empty_lines: true
		});

		file.pipe(parser);

		const terms: TeamTerm[] = [];

		parser.on('readable', function () {
			let record;
			while (record = parser.read()) {
				terms.push({
					id: record.id,
					term: record.term,
					localized: record.localized
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