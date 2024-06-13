/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
let ourStopwords = [
	'about',
	'above',
	'after',
	'again',
	'all',
	'also',
	'am',
	'an',
	'and',
	'another',
	'any',
	'are',
	'as',
	'at',
	'be',
	'because',
	'been',
	'before',
	'being',
	'below',
	'between',
	'both',
	'but',
	'by',
	'came',
	'can',
	'cannot',
	'come',
	'could',
	'did',
	'do',
	'does',
	'doing',
	'during',
	'each',
	'few',
	'for',
	'from',
	'further',
	'get',
	'got',
	'has',
	'had',
	'he',
	'have',
	'her',
	'here',
	'him',
	'himself',
	'his',
	'how',
	'if',
	'in',
	'into',
	'is',
	'it',
	'its',
	'itself',
	'like',
	'make',
	'many',
	'me',
	'might',
	'more',
	'most',
	'much',
	'must',
	'my',
	'myself',
	'never',
	'now',
	'of',
	'on',
	'only',
	'or',
	'other',
	'our',
	'ours',
	'ourselves',
	'out',
	'over',
	'own',
	'said',
	'same',
	'see',
	'she',
	'should',
	'since',
	'so',
	'some',
	'still',
	'such',
	'take',
	'than',
	'that',
	'the',
	'their',
	'theirs',
	'them',
	'themselves',
	'then',
	'there',
	'these',
	'they',
	'this',
	'those',
	'through',
	'to',
	'too',
	'under',
	'until',
	'up',
	'very',
	'was',
	'way',
	'we',
	'well',
	'were',
	'what',
	'where',
	'when',
	'which',
	'while',
	'who',
	'whom',
	'with',
	'would',
	'why',
	'you',
	'your',
	'yours',
	'yourself',
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z',
	'$',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'0',
	'_',
];

declare type DocumentType = string | string[] | Record<string, string>;
declare type TfIdfCallback = (i: number, measure: number, key?: string | Record<string, any>) => void;

export class Tokenizer {
	trim(array: string[]): string[] {
		while (array[array.length - 1] === '') {
			array.pop();
		}

		while (array[0] === '') {
			array.shift();
		}

		return array;
	}
}

export declare interface RegexTokenizerOptions {
	pattern?: RegExp;
	discardEmpty?: boolean;
	gaps?: boolean;
}

export class RegexpTokenizer extends Tokenizer {
	_pattern: RegExp = /\s+/;
	discardEmpty: boolean = true;
	_gaps: boolean | undefined;

	constructor(opts?: RegexTokenizerOptions) {
		super();
		const options = opts || {};
		this._pattern = options.pattern || this._pattern;
		this.discardEmpty = options.discardEmpty || true;

		// Match and split on GAPS not the actual WORDS
		this._gaps = options.gaps;

		if (this._gaps === undefined) {
			this._gaps = true;
		}
	}

	tokenize(s: string): string[] {
		let results;

		if (this._gaps) {
			results = s.split(this._pattern);
			return this.discardEmpty ? this.without(results, '', ' ') : results;
		} else {
			results = s.match(this._pattern);
			if (results) {
				return results;
			} else {
				return [];
			}
		}
	}

	without(arr: any[], ...values: any[]) {
		return arr.filter(item => !values.includes(item));
	}
}

export class WordTokenizer extends RegexpTokenizer {
	constructor(options?: RegexTokenizerOptions) {
		super(options);
		this._pattern = /[^A-Za-zА-Яа-я0-9_]+/;
	}
}

/// based on: https://github.com/NaturalNode/natural/blob/master/lib/natural/tfidf/tfidf.js
export class TfIdf<K, V> {
	documents: DocumentType[] = [];
	_idfCache: Record<string, number> = {};
	tokenizer: RegexpTokenizer = new WordTokenizer();

	constructor() {
		this.documents = [];
		this._idfCache = {};
	}

	static tf(term: string, document: DocumentType) {
		// @ts-ignore
		return document[term] ? document[term] : 0;
	}

	// Returns the inverse document frequency of the term
	// If force is true the cache will be invalidated and recomputed
	idf(term: string, force: boolean | undefined = undefined) {
		const this_ = this;
		// Lookup the term in the New term-IDF caching,
		// this will cut search times down exponentially on large document sets.
		// if (this._idfCache[term] && this._idfCache.hasOwnProperty(term) && force !== true) { return this._idfCache[term] }
		if (this._idfCache[term] && force !== true) {
			return this._idfCache[term];
		}

		// Count the number of documents that contain the term
		const docsWithTerm = this.documents.reduce(
			(count: number, document: DocumentType) => count + (this_.documentHasTerm(term, document) ? 1 : 0),
			0,
		);

		// Compute the inverse document frequency
		const idf = 1 + Math.log(this.documents.length / (1 + docsWithTerm));

		// Add the idf to the term cache and return it
		this._idfCache[term] = idf;
		return idf;
	}

	documentHasTerm(term: string, document: DocumentType) {
		// @ts-ignore
		return document[term] && document[term] > 0;
	}

	// Returns a frequency map of word to frequency
	// Key is the document key and stored in the map that is returned as __keys
	buildDocument(text: DocumentType, key?: Record<string, any> | any): Record<string, any> {
		let stopOut: boolean;

		if (typeof text === 'string') {
			text = this.tokenizer.tokenize(text.toLowerCase());
			stopOut = true;
		} else if (!Array.isArray(text)) {
			stopOut = false;
			return text;
		}

		return text.reduce(
			function (document: any, term: string) {
				// next line solves https://github.com/NaturalNode/natural/issues/119
				if (typeof document[term] === 'function') {
					document[term] = 0;
				}
				if (!stopOut || ourStopwords.indexOf(term) < 0) {
					document[term] = document[term] ? document[term] + 1 : 1;
				}

				return document;
			},
			{ __key: key },
		);
	}

	// If restoreCache is set to true, all terms idf scores currently cached will be recomputed.
	// Otherwise, the cache will just be wiped clean
	addDocument(document: DocumentType, key?: Record<string, any> | any, restoreCache?: boolean) {
		this.documents.push(this.buildDocument(document, key));

		// make sure the cache is invalidated when new documents arrive
		if (restoreCache) {
			for (const term in this._idfCache) {
				// invoking idf with the force option set will
				// force a recomputation of the idf, and it will
				// automatically refresh the cache value.
				this.idf(term, true);
			}
		} else {
			// this._idfCache = {}
			// so that we do not have trouble with terms that match property names
			this._idfCache = Object.create(null);
		}
	}

	/**
	 * The `tfidf` method is used to calculate the Term Frequency-Inverse Document Frequency (TF-IDF) for a
	 * given term or array of terms in a specific document. TF-IDF is a numerical statistic that reflects how
	 * important a word is to a document in a collection or corpus.
	 *
	 * @param terms - A string or an array of strings representing the term(s) for which the TF-IDF is to be calculated. If a string is passed, it is tokenized into an array of terms.
	 * @param d - A number representing the index of the document in the documents array for which the TF-IDF is to be calculated.
	 *
	 * @returns A number representing the TF-IDF of the given term(s) in the specified document. If the term does not exist in the document, the method returns 0. If multiple terms are passed, the method returns the sum of the TF-IDF of all the terms.
	 *
	 * The method first checks if the `terms` parameter is an array. If not, it converts the string into an array of terms using the `tokenizer.tokenize` method. It then reduces this array to a single number by iterating over each term, calculating its TF-IDF, and adding it to the accumulator. The TF-IDF of a term is calculated as the product of its term frequency (TF) in the document and its inverse document frequency (IDF). The TF is calculated using the `TfIdf.tf` method and the IDF is calculated using the `idf` method. If the IDF is Infinity (which happens when the term does not exist in any document), it is set to 0.
	 *
	 * Note: The method uses the `this` keyword to refer to the instance of the class it is defined in. Therefore, it cannot be called as a standalone function.
	 */
	tfidf(terms: string | string[], d: number): number {
		const _this = this;

		if (!Array.isArray(terms)) {
			terms = this.tokenizer.tokenize(terms.toString().toLowerCase());
		}

		return terms.reduce(function (value, term) {
			let idf = _this.idf(term);
			idf = idf === Infinity ? 0 : idf;
			return value + TfIdf.tf(term, _this.documents[d]) * idf;
		}, 0.0);
	}

	listTerms(d: number) {
		const terms = [];
		const _this = this;
		// @ts-ignore
		for (const term in this.documents[d]) {
			if (this.documents[d]) {
				if (term !== '__key') {
					terms.push({
						term,
						tf: TfIdf.tf(term, _this.documents[d]),
						idf: _this.idf(term),
						tfidf: _this.tfidf(term, d),
					});
				}
			}
		}

		return terms.sort(function (x, y) {
			return y.tfidf - x.tfidf;
		});
	}

	tfidfs(terms: string | string[], callback?: TfIdfCallback): number[] {
		const tfidfs = new Array(this.documents.length);

		for (let i = 0; i < this.documents.length; i++) {
			tfidfs[i] = this.tfidf(terms, i);

			if (callback) {
				callback(i, tfidfs[i], (this.documents[i] as any).__key);
			}
		}

		return tfidfs;
	}

	// Define a tokenizer other than the default "WordTokenizer"
	setTokenizer(t: any) {
		if (!(typeof t.tokenize === 'function')) {
			throw new Error('Expected a valid Tokenizer');
		}

		this.tokenizer = t;
	}

	// Define a stopwords other than the default
	setStopwords(customStopwords: string[]) {
		if (!Array.isArray(customStopwords)) {
			return false;
		}

		let wrongElement = false;
		customStopwords.forEach(stopword => {
			if (typeof stopword !== 'string') {
				wrongElement = true;
			}
		});
		if (wrongElement) {
			return false;
		}

		ourStopwords = customStopwords;
		return true;
	}
}
