import path from "path";
import fs from "fs";
import os from "os";

import { CodebaseIndex, IndexTag, IndexingProgressUpdate, BranchAndDir } from "./CodebaseIndex";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { Chunk } from "../chunk/Chunk";

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

export class LanceDbIndex implements CodebaseIndex {
	get artifactId(): string {
		return "vectordb::" + this.embeddingsProvider.id;
	}

	constructor(
		private readonly embeddingsProvider: EmbeddingsProvider,
		private readonly readFile: (filepath: string) => Promise<string>,
	) {
	}


	update(tag: IndexTag, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate, any, unknown> {
		throw new Error("Method not implemented.");
	}

	async retrieve(
		query: string,
		n: number,
		tags: BranchAndDir[],
		filterDirectory: string | undefined,
	): Promise<Chunk[]> {
		const lancedb = await import("vectordb");
		if (!lancedb.connect) {
			throw new Error("LanceDB failed to load a native module");
		}
		const [vector] = await this.embeddingsProvider.embed([query]);
		const db = await lancedb.connect(getLanceDbPath());

		// todo;
		return [];
	}
}