import fs from 'fs';
import path from 'path';

import { inferLanguage } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { ContextItem, ContextSubmenuItem } from '../../context-provider/_base/BaseContextProvider';
import { IdeAction } from '../../editor/editor-api/IdeAction';
import { ChunkWithoutID } from '../chunk/_base/Chunk';
import { DatabaseConnection, SqliteDb } from '../database/SqliteDb';
import { tagToString } from '../refreshIndex';
import { Point, TextRange } from '../scope-graph/model/TextRange';
import { getBasename } from '../utils/IndexPathHelper';
import {
	CodebaseIndex,
	IndexingProgressUpdate,
	IndexResultType,
	IndexTag,
	MarkCompleteCallback,
	RefreshIndexResults,
} from './_base/CodebaseIndex';

/**
 * for provider {@link CodeContextProvider}
 */
export class CodeSnippetsCodebaseIndex implements CodebaseIndex {
	artifactId = 'codeSnippets';

	constructor(
		private readonly ide: IdeAction,
		private languageService: ILanguageServiceProvider,
	) {}

	private static async _createTables(db: DatabaseConnection) {
		await db.exec(`CREATE TABLE IF NOT EXISTS code_snippets (
        id INTEGER PRIMARY KEY,
        path TEXT NOT NULL,
        cacheKey TEXT NOT NULL,
        content TEXT NOT NULL,
        title TEXT NOT NULL,
        startLine INTEGER NOT NULL,
        endLine INTEGER NOT NULL
    )`);

		await db.exec(`CREATE TABLE IF NOT EXISTS code_snippets_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT NOT NULL,
      snippetId INTEGER NOT NULL,
      FOREIGN KEY (snippetId) REFERENCES code_snippets (id)
    )`);
	}

	private getQuerySource(filepath: string) {
		const fullLangName = inferLanguage(filepath);
		const sourcePath = path.join(
			__dirname,
			'..',
			'schemas',
			'code-snippet-queries',
			`tree-sitter-${fullLangName}-tags.scm`,
		);
		if (!fs.existsSync(sourcePath)) {
			return '';
		}

		return fs.readFileSync(sourcePath).toString();
	}

	async getSnippetsInFile(filepath: string, contents: string): Promise<(ChunkWithoutID & { title: string })[]> {
		const language = inferLanguage(filepath);

		const parser = await this.languageService.getParser(language);
		if (!parser) {
			return [];
		}

		const lang = parser.getLanguage();

		const ast = parser.parse(contents);
		const query = lang.query(this.getQuerySource(filepath));
		const matches = query.matches(ast.rootNode);

		return (
			matches?.flatMap(match => {
				const node = match.captures[0].node;
				const title = match.captures[1].node.text;
				const results = {
					title,
					content: node.text,
					startLine: node.startPosition.row,
					endLine: node.endPosition.row,
					language: language,
				};
				return results;
			}) ?? []
		);
	}

	async *update(
		tag: IndexTag,
		results: RefreshIndexResults,
		markComplete: MarkCompleteCallback,
		repoName: string | undefined,
	): AsyncGenerator<IndexingProgressUpdate, any, unknown> {
		const db = await SqliteDb.get();
		await CodeSnippetsCodebaseIndex._createTables(db);
		const tagString = tagToString(tag);

		for (let i = 0; i < results.compute.length; i++) {
			const compute = results.compute[i];

			let snippets: (ChunkWithoutID & { title: string })[] = [];
			try {
				snippets = await this.getSnippetsInFile(compute.path, await this.ide.readFile(compute.path));
			} catch (e) {
				// If can't parse, assume malformatted code
			}

			// Add snippets to sqlite
			for (const snippet of snippets) {
				const { lastID } = await db.run(
					`INSERT INTO code_snippets (path, cacheKey, content, title, startLine, endLine) VALUES (?, ?, ?, ?, ?, ?)`,
					[compute.path, compute.cacheKey, snippet.content, snippet.title, snippet.startLine, snippet.endLine],
				);

				await db.run(`INSERT INTO code_snippets_tags (snippetId, tag) VALUES (?, ?)`, [lastID, tagString]);
			}

			yield {
				desc: `Indexing ${compute.path}`,
				progress: i / results.compute.length,
			};
			markComplete([compute], IndexResultType.Compute);
		}

		for (let i = 0; i < results.del.length; i++) {
			const del = results.del[i];
			const deleted = await db.run(`DELETE FROM code_snippets WHERE path = ? AND cacheKey = ?`, [
				del.path,
				del.cacheKey,
			]);
			await db.run(`DELETE FROM code_snippets_tags WHERE snippetId = ?`, [deleted.lastID]);
			markComplete([del], IndexResultType.Delete);
		}

		for (let i = 0; i < results.addTag.length; i++) {
			const snippetsWithPath = await db.all(`SELECT * FROM code_snippets WHERE cacheKey = ?`, [
				results.addTag[i].cacheKey,
			]);

			for (const snippet of snippetsWithPath) {
				await db.run(`INSERT INTO code_snippets_tags (snippetId, tag) VALUES (?, ?)`, [snippet.id, tagString]);
			}

			markComplete([results.addTag[i]], IndexResultType.AddTag);
		}

		for (let i = 0; i < results.removeTag.length; i++) {
			const item = results.removeTag[i];
			await db.run(
				`
        DELETE FROM code_snippets_tags
        WHERE tag = ?
          AND snippetId IN (
            SELECT id FROM code_snippets
            WHERE cacheKey = ? AND path = ?
          )
      `,
				[tagString, item.cacheKey, item.path],
			);
			markComplete([results.removeTag[i]], IndexResultType.RemoveTag);
		}
	}

	static async getForId(id: number): Promise<ContextItem> {
		const db = await SqliteDb.get();
		const row = await db.get(`SELECT * FROM code_snippets WHERE id = ?`, [id]);
		const range = new TextRange(new Point(row.startLine, 0, 0), new Point(row.endLine, 0, 0), row.content);

		return {
			name: row.title,
			path: row.path,
			range,
			description: getBasename(row.path, 2),
			content: `\`\`\`${getBasename(row.path)}\n${row.content}\n\`\`\``,
		};
	}

	static async getAll(tag: IndexTag): Promise<ContextSubmenuItem[]> {
		const db = await SqliteDb.get();
		await CodeSnippetsCodebaseIndex._createTables(db);
		try {
			const rows = await db.all(
				`SELECT cs.id, cs.path, cs.title
        FROM code_snippets cs
        JOIN code_snippets_tags cst ON cs.id = cst.snippetId
        WHERE cst.tag = ?;
        `,
				[tagToString(tag)],
			);

			return rows.map(row => ({
				title: row.title,
				description: getBasename(row.path, 2),
				id: row.id.toString(),
			}));
		} catch (e) {
			console.warn('Error getting all code snippets: ', e);
			return [];
		}
	}
}
