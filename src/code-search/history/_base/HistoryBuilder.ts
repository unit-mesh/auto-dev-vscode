import { GitCommit } from '../../../git/model/GitCommit';

export class HistoryBuilder {
	/// build by issue id / story id
	buildByIssueId(issueId: string): GitCommit[] {
		return [];
	}

	/// build by single file with function
	buildBySingleFile(filePath: string): GitCommit[] {
		return [];
	}

	buildBySymbolId(symbolId: string): GitCommit[] {
		return [];
	}

	/// build by all
	buildAll(): GitCommit[] {
		return [];
	}
}
