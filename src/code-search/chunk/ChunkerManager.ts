import { ChunkItem, Embedding, ScoredItem } from "../embedding/_base/Embedding";
import { Chunk, ChunkWithoutID } from "./_base/Chunk";
import { ConstructCodeChunker } from "./ConstructCodeChunker";
import { EXT_LANGUAGE_MAP, languageFromPath } from "../../editor/language/ExtensionLanguageMap";
import { basicChunker } from "./BasicChunker";
import { countTokens } from "../token/TokenCounter";
import { MAX_CHUNK_SIZE } from "../utils/constants";

const DEFAULT_THRESHOLD = 0.72;

export class ChunkerManager {
	private static instance_: ChunkerManager;

	private constructor() {
	}

	static getInstance(): ChunkerManager {
		if (!ChunkerManager.instance_) {
			ChunkerManager.instance_ = new ChunkerManager();
		}
		return ChunkerManager.instance_;
	}

	static filterAndSortByScore<T extends ChunkItem>(embeddings: Embedding[], items: T[], limit: number, minThreshold: number = DEFAULT_THRESHOLD): T[] {
		return items.flatMap((item: T) => {
			let maxScore: number = 0;
			for (let embedding of embeddings) {
				let score: number = item.embedding.reduce((total: number, value: number, index: number) => total + value * embedding[index], 0);
				maxScore = Math.max(maxScore, score);
			}
			return { score: maxScore, item: item } as ScoredItem<T>;
		}).filter((scoredItem: ScoredItem<T>) => scoredItem.score > minThreshold)
			.sort((a: ScoredItem<T>, b: ScoredItem<T>) => b.score - a.score)
			.slice(0, limit)
			.map((scoredItem: ScoredItem<T>) => scoredItem.item);
	}

	async* chunkDocumentWithoutId(
		filepath: string,
		contents: string,
		maxChunkSize: number,
	): AsyncGenerator<ChunkWithoutID> {
		if (contents.trim() === "") {
			return;
		}

		const language = languageFromPath(filepath);
		const chunker = new ConstructCodeChunker();
		const segs = filepath.split(".");
		const ext = segs[segs.length - 1];
		if (ext in EXT_LANGUAGE_MAP) {
			try {
				for await (const chunk of chunker.chunk(filepath, contents, maxChunkSize)) {
					yield chunk;
				}
				return;
			} catch (e) {
				// console.error(`Failed to parse ${filepath}: `, e);
				// falls back to basicChunker
			}
		}

		yield* basicChunker(contents, maxChunkSize, language);
	}

	async* chunkDocument(
		filepath: string,
		contents: string,
		maxChunkSize: number,
		digest: string,
	): AsyncGenerator<Chunk> {
		let language = languageFromPath(filepath);
		let index = 0;
		for await (let chunkWithoutId of this.chunkDocumentWithoutId(
			filepath,
			contents,
			maxChunkSize,
		)) {
			if (countTokens(chunkWithoutId.content) > MAX_CHUNK_SIZE) {
				console.warn(
					`Chunk with more than ${maxChunkSize} tokens constructed: `,
					filepath,
					countTokens(chunkWithoutId.content),
				);
				continue;
			}
			yield {
				...chunkWithoutId,
				language,
				digest,
				index,
				filepath,
			};
			index++;
		}
	}
}