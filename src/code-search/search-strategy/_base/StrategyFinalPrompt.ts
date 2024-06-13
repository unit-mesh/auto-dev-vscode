import { ChunkItem } from '../../embedding/_base/Embedding';

export class StrategyFinalPrompt {
	constructor(
		public readonly prompt: string,
		public readonly chunks: ChunkItem[],
	) {}
}
