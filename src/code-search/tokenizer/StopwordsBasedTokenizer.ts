/*
Copyright (c) 2011, David Przybilla, Chris Umbel

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
import { TermSplitter } from '../search/tfidf/TermSplitter';
import { CodeTokenizer } from './CodeTokenizer';

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
const CHINESE_STOP_WORDS = [
	'的',
	'地',
	'得',
	'和',
	'跟',
	'与',
	'及',
	'向',
	'并',
	'等',
	'更',
	'已',
	'含',
	'做',
	'我',
	'你',
	'他',
	'她',
	'们',
	'某',
	'该',
	'各',
	'每',
	'这',
	'那',
	'哪',
	'什',
	'么',
	'谁',
	'年',
	'月',
	'日',
	'时',
	'分',
	'秒',
	'几',
	'多',
	'来',
	'在',
	'就',
	'又',
	'很',
	'呢',
	'吧',
	'吗',
	'了',
	'嘛',
	'哇',
	'儿',
	'哼',
	'啊',
	'嗯',
	'是',
	'着',
	'都',
	'不',
	'说',
	'也',
	'看',
	'把',
	'还',
	'个',
	'有',
	'小',
	'到',
	'一',
	'为',
	'中',
	'于',
	'对',
	'会',
	'之',
	'第',
	'此',
	'或',
	'共',
	'按',
	'请',
];

/**
 * The `tokenize` method takes a string as an input and returns a set of unique words (tokens) from the input string.
 * It first splits the input string into individual words or terms using the `splitIntoTerms` method.
 * Then it filters out any words that are present in the `stopWordsSet`.
 * The `stopWordsSet` is a set of common words that are usually ignored in natural language processing due to their lack of meaningful information.
 *
 * @param input - A string that needs to be tokenized.
 *
 * @returns A set of unique words from the input string after removing the stop words.
 *
 * @throws Will throw an error if the input is not a string.
 *
 * @example
 *
 * This method is part of a text processing or natural language processing workflow, where the input string is a sentence or a paragraph of text.
 *
 * Note: This method does not handle punctuation or special characters. It is assumed that the input string is preprocessed to remove such characters.
 *
 */
export class StopwordsBasedTokenizer implements CodeTokenizer {
	// singletons
	private static instance_: StopwordsBasedTokenizer;

	static instance() {
		if (!this.instance_) {
			this.instance_ = new StopwordsBasedTokenizer();
		}
		return this.instance_;
	}

	private constructor() {}

	stopWords = [
		'we',
		'our',
		'you',
		'it',
		'its',
		'they',
		'them',
		'their',
		'this',
		'that',
		'these',
		'those',
		'is',
		'are',
		'was',
		'were',
		'be',
		'been',
		'being',
		'have',
		'has',
		'had',
		'having',
		'do',
		'does',
		'did',
		'doing',
		'can',
		'don',
		't',
		's',
		'will',
		'would',
		'should',
		'what',
		'which',
		'who',
		'when',
		'where',
		'why',
		'how',
		'a',
		'an',
		'the',
		'and',
		'or',
		'not',
		'no',
		'but',
		'because',
		'as',
		'until',
		'again',
		'further',
		'then',
		'once',
		'here',
		'there',
		'all',
		'any',
		'both',
		'each',
		'few',
		'more',
		'most',
		'other',
		'some',
		'such',
		'above',
		'below',
		'to',
		'during',
		'before',
		'after',
		'of',
		'at',
		'by',
		'about',
		'between',
		'into',
		'through',
		'from',
		'up',
		'down',
		'in',
		'out',
		'on',
		'off',
		'over',
		'under',
		'only',
		'own',
		'same',
		'so',
		'than',
		'too',
		'very',
		'just',
		'now',
	];

	programmingKeywords = [
		'if',
		'then',
		'else',
		'for',
		'while',
		'with',
		'def',
		'function',
		'return',
		'TODO',
		'import',
		'try',
		'catch',
		'raise',
		'finally',
		'repeat',
		'switch',
		'case',
		'match',
		'assert',
		'continue',
		'break',
		'const',
		'class',
		'enum',
		'struct',
		'static',
		'new',
		'super',
		'this',
		'var',
	];

	javaKeywords = [
		'public',
		'private',
		'protected',
		'static',
		'final',
		'abstract',
		'interface',
		'implements',
		'extends',
		'throws',
		'throw',
		'try',
		'catch',
		'finally',
		'synchronized',
	];

	chineseStopWords = CHINESE_STOP_WORDS;

	stopWordsSet = new Set([
		...this.stopWords,
		...this.programmingKeywords,
		...this.javaKeywords,
		...this.chineseStopWords,
	]);

	tokenize(input: string): Set<string> {
		return new Set(this.splitIntoTerms(input).filter(word => !this.stopWordsSet.has(word)));
	}

	/**
	 * {@link DomainTermService} is a service that provides domain-specific terms for a given domain.
	 */
	splitIntoTerms(input: string): string[] {
		return TermSplitter.syncSplitTerms(input);
	}
}
