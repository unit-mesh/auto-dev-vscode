/**
 *  Copyright 2023 Continue Dev, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import { DatabaseConnection, SqliteDb } from "../database/SqliteDb";
import {
  BranchAndDir,
  CodebaseIndex,
  IndexingProgressUpdate, IndexResultType,
  IndexTag,
  MarkCompleteCallback,
  RefreshIndexResults
} from "../indexing/_base/CodebaseIndex";
import { RETRIEVAL_PARAMS } from "../utils/constants";
import { Chunk } from "../chunk/_base/Chunk";
import { ChunkCodebaseIndex } from "../indexing/ChunkCodebaseIndex";
import { tagToString } from "../refreshIndex";

export class FullTextSearchCodebaseIndex implements CodebaseIndex {
  artifactId: string = "sqliteFts";

  private async _createTables(db: DatabaseConnection) {
    await db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(
        path,
        content,
        tokenize = 'trigram'
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS fts_metadata (
        id INTEGER PRIMARY KEY,
        path TEXT NOT NULL,
        cacheKey TEXT NOT NULL,
        chunkId INTEGER NOT NULL,
        FOREIGN KEY (chunkId) REFERENCES chunks (id),
        FOREIGN KEY (id) REFERENCES fts (rowid)
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

    for (let i = 0; i < results.compute.length; i++) {
      const item = results.compute[i];

      // Insert chunks
      const chunks = await db.all(
        `SELECT * FROM chunks WHERE path = ? AND cacheKey = ?`,
        [item.path, item.cacheKey],
      );

      for (let chunk of chunks) {
        const { lastID } = await db.run(
          `INSERT INTO fts (path, content) VALUES (?, ?)`,
          [item.path, chunk.content],
        );
        await db.run(
          `INSERT INTO fts_metadata (id, path, cacheKey, chunkId) VALUES (?, ?, ?, ?)`,
          [lastID, item.path, item.cacheKey, chunk.id],
        );
      }

      yield {
        progress: i / results.compute.length,
        desc: `Indexing ${item.path}`,
      };
      markComplete([item], IndexResultType.Compute);
    }

    // Add tag
    for (const item of results.addTag) {
      markComplete([item], IndexResultType.AddTag);
    }

    // Remove tag
    for (const item of results.removeTag) {
      markComplete([item], IndexResultType.RemoveTag);
    }

    // Delete
    for (const item of results.del) {
      const { lastID } = await db.run(
        `DELETE FROM fts_metadata WHERE path = ? AND cacheKey = ?`,
        [item.path, item.cacheKey],
      );
      await db.run(`DELETE FROM fts WHERE rowid = ?`, [lastID]);

      markComplete([item], IndexResultType.Delete);
    }
  }

  async retrieve(
    tags: BranchAndDir[],
    text: string,
    n: number,
    directory: string | undefined,
    filterPaths: string[] | undefined,
    bm25Threshold: number = RETRIEVAL_PARAMS.bm25Threshold,
    language: string | undefined = undefined,
  ): Promise<Chunk[]> {
    const db = await SqliteDb.get();

    // Notice that the "chunks" artifactId is used because of linking between tables
    const tagStrings = tags.map((tag) => {
      return tagToString({ ...tag, artifactId: ChunkCodebaseIndex.artifactId });
    });

    const query = `SELECT fts_metadata.chunkId, fts_metadata.path, fts.content, rank
    FROM fts
    JOIN fts_metadata ON fts.rowid = fts_metadata.id
    JOIN chunk_tags ON fts_metadata.chunkId = chunk_tags.chunkId
    WHERE fts MATCH '${text.replace(/\?/g, "",)}'
      AND chunk_tags.tag IN (${tagStrings.map(() => "?").join(",")}) 
      ${ filterPaths ? `AND fts_metadata.path IN (${filterPaths.map(() => "?").join(",")})` : ""}
    ORDER BY rank
    LIMIT ?`;

    let results = await db.all(query, [
      ...tagStrings,
      ...(filterPaths || []),
      Math.ceil(n),
    ]);

    results = results.filter((result) => result.rank <= bm25Threshold);

    let sql = `SELECT * FROM chunks 
       WHERE id IN (${results.map(() => "?").join(",")})
       ${ language ? `AND language == '${language}'` : ""}
    `;

    const chunks = await db.all(
      sql,
      results.map((result) => result.chunkId),
    );

    return chunks.map((chunk) => {
      return {
        filepath: chunk.path,
        index: chunk.index,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        content: chunk.content,
        digest: chunk.cacheKey,
        language: chunk.language,
      };
    });
  }
}
