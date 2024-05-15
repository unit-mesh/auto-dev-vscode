/**
 * Copyright 2023 Continue
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { cleanFragment, cleanHeader } from "../../../markdown/MarkdownClean";
import { Article, ArticleComponent } from "./ArticleCrawl";
import { MAX_CHUNK_SIZE } from "../../utils/constants";
import { Chunk } from "../../chunk/_base/Chunk";

function breakdownArticleComponent(
	url: string,
	article: ArticleComponent,
	subpath: string,
): Chunk[] {
	let chunks: Chunk[] = [];

	let lines = article.body.split("\n");
	let startLine = 0;
	let endLine = 0;
	let content = "";
	let index = 0;

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		if (content.length + line.length <= MAX_CHUNK_SIZE) {
			content += line + "\n";
			endLine = i;
		} else {
			chunks.push({
				language: "markdown", // TODO: chunk in different languages
				content: content.trim(),
				startLine: startLine,
				endLine: endLine,
				otherMetadata: {
					title: cleanHeader(article.title),
				},
				index: index,
				filepath: new URL(
					subpath + `#${cleanFragment(article.title)}`,
					url,
				).toString(),
				digest: subpath,
			});
			content = line + "\n";
			startLine = i;
			endLine = i;
			index += 1;
		}
	}

	// Push the last chunk
	if (content) {
		chunks.push({
			language: "markdown", // TODO: chunk in different languages
			content: content.trim(),
			startLine: startLine,
			endLine: endLine,
			otherMetadata: {
				title: cleanHeader(article.title),
			},
			index: index,
			filepath: new URL(
				subpath + `#${cleanFragment(article.title)}`,
				url,
			).toString(),
			digest: subpath,
		});
	}

	// Don't use small chunks. Probably they're a mistake. Definitely they'll confuse the embeddings model.
	return chunks.filter((c) => c.content.trim().length > 20);
}

export function chunkArticle(articleResult: Article): Chunk[] {
	let chunks: Chunk[] = [];

	for (let article of articleResult.article_components) {
		let articleChunks = breakdownArticleComponent(
			articleResult.url,
			article,
			articleResult.subpath,
		);
		chunks = [...chunks, ...articleChunks];
	}

	return chunks;
}