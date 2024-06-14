import { SystemActionType } from '../../action/setting/SystemActionType';
import { AutoDevExtension } from '../../AutoDevExtension';
import { logger } from '../../base/common/log/log';
import { StrategyFinalPrompt } from '../../code-search/search-strategy/_base/StrategyFinalPrompt';
import { HydeCodeStrategy } from '../../code-search/search-strategy/HydeCodeStrategy';
import { HydeKeywordsStrategy } from '../../code-search/search-strategy/HydeKeywordsStrategy';
import { QueryExpansion } from '../../domain/QueryExpansion';
import { TeamTermService } from '../../domain/TeamTermService';

export class Catalyser {
	private queryExpansion: QueryExpansion;

	constructor(
		private extension: AutoDevExtension,
		private teamTermService: TeamTermService,
	) {
		this.queryExpansion = new QueryExpansion(this.teamTermService);
	}

	async query(query: string, type: SystemActionType): Promise<string | undefined> {
		logger.append('Semantic search for code: ' + query + '\n');
		let expandedQuery = this.queryExpansion.expand(query);
		logger.append('Expanded query: ' + expandedQuery + '\n');

		let finalPrompt: StrategyFinalPrompt | undefined = undefined;
		switch (type) {
			case SystemActionType.SemanticSearchKeyword:
				let keywordsStrategy = new HydeKeywordsStrategy(expandedQuery, this.extension);
				finalPrompt = await keywordsStrategy.execute();
				break;
			case SystemActionType.SemanticSearchCode:
				let strategy = new HydeCodeStrategy(expandedQuery, this.extension);
				finalPrompt = await strategy.execute();
				break;
			default:
				logger.append('Unknown action type: ' + type + '\n');
				break;
		}

		if (!finalPrompt) {
			logger.append('No output from the strategy\n');
			return;
		}

		if (finalPrompt.chunks.length > 0) {
			logger.appendLine('Found ' + finalPrompt.chunks.length + ' code snippets\n');
			for (let chunk of finalPrompt.chunks) {
				// a file path will be like: `build.gradle.kts (0-5)`, we need to parse range from name
				let rangeResult = chunk.name.match(/\((\d+)-(\d+)\)/);

				let start = rangeResult ? parseInt(rangeResult[1]) : 0;
				let end = rangeResult ? parseInt(rangeResult[2]) : chunk.text.length;

				logger.appendLine('File: ' + chunk.path + ' (' + start + ' - ' + end + ')');
			}
		}

		return finalPrompt.prompt;
	}
}
