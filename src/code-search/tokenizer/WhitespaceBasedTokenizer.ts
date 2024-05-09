import { CodeTokenizer } from "./CodeTokenizer";

export class WhitespaceBasedTokenizer implements CodeTokenizer {
	tokenize(input: string): Set<string> {
		let words = this.splitIntoWords(input);
		return new Set(words);
	}

	/**
	 * @param input
	 */
	splitIntoWords(input: string): string[] {
		return input.split(/[^a-zA-Z0-9]/).filter(word => word.length > 0);
	}
}