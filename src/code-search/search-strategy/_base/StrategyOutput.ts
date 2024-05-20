import { ChunkItem } from "../../embedding/_base/Embedding";

export class StrategyOutput {
	constructor(public readonly output: string, public readonly chunks: ChunkItem[]) {
	}
}
