import { TeamTermService } from "./TeamTermService";
import { TeamTerm } from "./TeamTerm";

export class QueryExpansion {
	private static instance_: QueryExpansion;

	static instance() {
		if (!this.instance_) {
			this.instance_ = new QueryExpansion();
		}

		return this.instance_;
	}

	private constructor() {
	}

	expand(query: string): string {
		const terms: TeamTerm[] = TeamTermService.instance().fetch();

		terms.forEach((term) => {
			query = query.replace(term.localized, term.localized + '(' + term.term + ')');
		});

		return query;
	}
}