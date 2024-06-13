import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { TreeSitterFile } from '../../code-context/ast/TreeSitterFile';
import { Chunk } from '../chunk/_base/Chunk';
import { ChunkerManager } from '../chunk/ChunkerManager';
import { DatabaseConnection, SqliteDb } from '../database/SqliteDb';
import { tagToString } from '../refreshIndex';
import { Symbol } from '../scope-graph/model/Symbol';
import { MAX_CHUNK_SIZE } from '../utils/constants';
import { getBasename } from '../utils/IndexPathHelper';
import {
	CodebaseIndex,
	IndexingProgressUpdate,
	IndexResultType,
	IndexTag,
	MarkCompleteCallback,
	RefreshIndexResults,
} from './_base/CodebaseIndex';

async function buildSymbols(languageService: ILanguageServiceProvider, chunk: Chunk): Promise<string> {
	try {
		let tsfile = await TreeSitterFile.create(chunk.content, chunk.language, languageService, chunk.filepath);
		let scopeGraph = await tsfile.scopeGraph();
		return Symbol.symbolLocations(scopeGraph, chunk.content);
	} catch (e) {
		return '';
	}
}

export class ChunkCodebaseIndex implements CodebaseIndex {
	static artifactId: string = 'chunks';
	artifactId: string = ChunkCodebaseIndex.artifactId;

	constructor(
		private languageService: ILanguageServiceProvider,
		private readFile: (filepath: string) => Promise<string>,
		private chunkerManager: ChunkerManager,
	) {
		this.readFile = readFile;
	}

	/// add for symbols
	private async _createTables(db: DatabaseConnection) {
		await db.exec(`CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cacheKey TEXT NOT NULL,
      path TEXT NOT NULL,
      idx INTEGER NOT NULL,
      startLine INTEGER NOT NULL,
      endLine INTEGER NOT NULL,
      content TEXT NOT NULL,
      language TEXT DEFAULT NULL,
      symbols TEXT DEFAULT NULL
    )`);

		await db.exec(`CREATE TABLE IF NOT EXISTS chunk_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT NOT NULL,
        chunkId INTEGER NOT NULL,
        FOREIGN KEY (chunkId) REFERENCES chunks (id)
    )`);
	}

	async *update(
		tag: IndexTag,
		results: RefreshIndexResults,
		markComplete: MarkCompleteCallback,
		repoName: string | undefined,
	): AsyncGenerator<IndexingProgressUpdate, any, unknown> {
		const db = await SqliteDb.get();
		await this._createTables(db);
		const tagString = tagToString(tag);

		const languageService = this.languageService;

		async function handleChunk(chunk: Chunk) {
			let symbols = await buildSymbols(languageService, chunk);
			const { lastID } = await db.run(
				`INSERT INTO chunks (cacheKey, path, idx, startLine, endLine, content, language, symbols) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					chunk.digest,
					chunk.filepath,
					chunk.index,
					chunk.startLine,
					chunk.endLine,
					chunk.content,
					chunk.language,
					symbols,
				],
			);

			await db.run(`INSERT INTO chunk_tags (chunkId, tag) VALUES (?, ?)`, [lastID, tagString]);
		}

		// Compute chunks for new files
		const contents = await Promise.all(results.compute.map(({ path }) => this.readFile(path)));
		for (let i = 0; i < results.compute.length; i++) {
			const item = results.compute[i];

			// Insert chunks
			for await (let chunk of this.chunkerManager.chunkDocument(
				item.path,
				contents[i],
				MAX_CHUNK_SIZE,
				item.cacheKey,
			)) {
				handleChunk(chunk);
			}

			yield {
				progress: i / results.compute.length,
				desc: `Chunking ${getBasename(item.path)}`,
			};
			markComplete([item], IndexResultType.Compute);
		}

		// Add tag
		for (const item of results.addTag) {
			const chunksWithPath = await db.all(`SELECT * FROM chunks WHERE cacheKey = ?`, [item.cacheKey]);

			for (const chunk of chunksWithPath) {
				await db.run(`INSERT INTO chunk_tags (chunkId, tag) VALUES (?, ?)`, [chunk.id, tagString]);
			}

			markComplete([item], IndexResultType.AddTag);
		}

		// Remove tag
		for (const item of results.removeTag) {
			await db.run(
				`
        DELETE FROM chunk_tags
        WHERE tag = ?
          AND chunkId IN (
            SELECT id FROM chunks
            WHERE cacheKey = ? AND path = ?
          )
      `,
				[tagString, item.cacheKey, item.path],
			);
			markComplete([item], IndexResultType.RemoveTag);
		}

		// Delete
		for (const item of results.del) {
			const deleted = await db.run(`DELETE FROM chunks WHERE cacheKey = ?`, [item.cacheKey]);

			// Delete from chunk_tags
			await db.run(`DELETE FROM chunk_tags WHERE chunkId = ?`, [deleted.lastID]);

			markComplete([item], IndexResultType.Delete);
		}
	}
}
