import { TeamTerm } from './TeamTerm';
import { TeamTermService } from './TeamTermService';

export class QueryExpansion {
	constructor(
		private teamTermService: TeamTermService,
	) {}

	expand(query: string): string {
		let terms: TeamTerm[] = [];
		try {
			terms = this.teamTermService.fetch();
		} catch (e) {
			console.info(e);
		}

		terms.forEach(term => {
			query = query.replace(term.localized, term.localized + '(' + term.term + ')');
		});

		return query;
	}
}
