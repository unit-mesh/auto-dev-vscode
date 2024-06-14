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
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export type ArticleComponent = {
	title: string;
	body: string;
};

export type Article = {
	url: string;
	subpath: string;
	title: string;
	article_components: ArticleComponent[];
};

export function stringToArticle(url: string, html: string, subpath: string): Article | undefined {
	try {
		const dom = new JSDOM(html);
		let reader = new Readability(dom.window.document);
		let article = reader.parse();

		if (!article) {
			return undefined;
		}

		let article_components = extractTitlesAndBodies(article.content);

		return {
			url,
			subpath,
			title: article.title,
			article_components,
		};
	} catch (err) {
		console.error('Error converting URL to article components', err);
		return undefined;
	}
}

function extractTitlesAndBodies(html: string): ArticleComponent[] {
	const dom = new JSDOM(html);
	const document = dom.window.document;

	const titles = Array.from(document.querySelectorAll('h2'));
	const result = titles.map(titleElement => {
		const title = titleElement.textContent || '';
		let body = '';
		let nextSibling = titleElement.nextElementSibling;

		while (nextSibling && nextSibling.tagName !== 'H2') {
			body += nextSibling.textContent || '';
			nextSibling = nextSibling.nextElementSibling;
		}

		return { title, body };
	});

	return result;
}
