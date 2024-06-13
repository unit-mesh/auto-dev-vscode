import { BranchAndDir } from '../indexing/_base/CodebaseIndex';

export class RetrievalQueryTerm {
	query = '';
	n = 0;
	tags: BranchAndDir[];
	filterDirectory?: string;
	language?: string;
	minimumScore: number;

	constructor(
		query: string,
		n: number,
		tags: BranchAndDir[],
		filterDirectory?: string,
		language?: string,
		minimumScore: number = 0.618,
	) {
		this.query = query;
		this.n = n;
		this.tags = tags;
		this.filterDirectory = filterDirectory;
		this.language = language;
		this.minimumScore = minimumScore;
	}
}
