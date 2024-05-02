import path from "path";
import fs from "fs";
import os from "os";
import { v4 as uuidv4 } from "uuid";

import { CodebaseIndex, IndexTag, IndexingProgressUpdate } from "./_base/CodebaseIndex";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { Chunk } from "../chunk/_base/Chunk";
import { MAX_CHUNK_SIZE } from "../constants";
import { ChunkerManager } from "../chunk/ChunkerManager";

export function getAutoDevGlobalPath(): string {
	// This is ~/.autodev on mac/linux
	const autodevPath = path.join(os.homedir(), ".autodev");
	if (!fs.existsSync(autodevPath)) {
		fs.mkdirSync(autodevPath);
	}
	return autodevPath;
}

export function getIndexFolderPath(): string {
	const indexPath = path.join(getAutoDevGlobalPath(), "index");
	if (!fs.existsSync(indexPath)) {
		fs.mkdirSync(indexPath);
	}
	return indexPath;
}

export function getLanceDbPath(): string {
	return path.join(getIndexFolderPath(), "lancedb");
}

export enum IndexResultType {
	Compute = "compute",
	Delete = "del",
	AddTag = "addTag",
	RemoveTag = "removeTag",
}

// LanceDB  converts to lowercase, so names must all be lowercase
interface LanceDbRow {
	uuid: string;
	path: string;
	cachekey: string;
	vector: number[];

	[key: string]: any;
}

export type PathAndCacheKey = {
	path: string;
	cacheKey: string;
};

export function getBasename(filepath: string, n: number = 1): string {
	return filepath.split(/[\\/]/).pop() ?? "";
}

export class LanceDbIndex implements CodebaseIndex {
	get artifactId(): string {
		return "vectordb::" + this.embeddingsProvider.id;
	}

	constructor(
		private readonly embeddingsProvider: EmbeddingsProvider,
		private readonly readFile: (filepath: string) => Promise<string>,
	) {
	}

	private async* computeChunks(
		items: PathAndCacheKey[],
	): AsyncGenerator<| [number, LanceDbRow, {
		startLine: number;
		endLine: number;
		contents: string
	}, string,] | PathAndCacheKey> {
		const contents = await Promise.all(
			items.map(({ path }) => this.readFile(path)),
		);

		for (let i = 0; i < items.length; i++) {
			// Break into chunks
			const content = contents[i];
			const chunks: Chunk[] = [];

			for await (let chunk of ChunkerManager.getInstance().chunkDocument(
				items[i].path,
				content,
				MAX_CHUNK_SIZE,
				items[i].cacheKey,
			)) {
				chunks.push(chunk);
			}

			if (chunks.length > 20) {
				// Too many chunks to index, probably a larger file than we want to include
				continue;
			}

			// Calculate embeddings
			const embeddings = await this.embeddingsProvider.embed(
				chunks.map((c) => c.content),
			);

			// Create row format
			for (let j = 0; j < chunks.length; j++) {
				const progress = (i + j / chunks.length) / items.length;
				const row = {
					vector: embeddings[j],
					path: items[i].path,
					cachekey: items[i].cacheKey,
					uuid: uuidv4(),
				};
				const chunk = chunks[j];
				yield [
					progress,
					row,
					{
						contents: chunk.content,
						startLine: chunk.startLine,
						endLine: chunk.endLine,
					},
					`Indexing ${getBasename(chunks[j].filepath)}`,
				];
			}

			yield items[i];
		}
	}

	update(tag: IndexTag, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate, any, unknown> {
		throw new Error("Method not implemented.");
	}

}