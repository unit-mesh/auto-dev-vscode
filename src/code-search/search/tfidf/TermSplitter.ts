// todo: add support for chinese characters??
export class TermSplitter {
	private static allPattern =
		/(?<![\p{Alphabetic}\p{Number}_$])[\p{Letter}_$][\p{Alphabetic}\p{Number}_$]{2,}(?![\p{Alphabetic}\p{Number}_$])/gu;
	private static camelCasePattern = /(?<=[a-z$])(?=[A-Z])/g;
	private static numericPattern = /^(\D+)\p{Number}+$/u;

	/**
	 * The `splitTerms` method is a static generator function that splits the input string into terms based on the naming styl
	 * e of the identifiers. It supports three naming styles: CamelCase, Numeric, and underscore_case.
	 *
	 * @param input - The input string to be split into terms.
	 *
	 * The method works as follows:
	 * 1. It matches all patterns in the input string.
	 * 2. For each match, it creates a new set to store unique terms, and adds the lowercase version of the match to this set.
	 * 3. It then splits the match into terms based on the CamelCase, underscore_case, and Numeric naming styles, and adds these terms to the terms array.
	 * 4. If the term is longer than 2 characters and matches the alphabetic pattern, it is added to the set of unique terms.
	 * 5. Finally, it yields each unique term.
	 *
	 * Note: The method uses the `matchAll`, `split`, and `match` methods of the String object, and the `add`
	 * method of the Set object. It also uses the spread operator (...) to add multiple elements to an array.
	 *
	 * @yield {String} - Yields each unique term.
	 *
	 */
	static *splitTerms(input: string) {
		let matchAll = input.matchAll(this.allPattern);
		for (let [match_] of matchAll) {
			let uniqueTerms: Set<string> = new Set();
			uniqueTerms.add(match_.toLowerCase());

			let terms = [];

			let camelCaseSplits = match_.split(this.camelCasePattern);
			if (camelCaseSplits.length > 1) {
				terms.push(...camelCaseSplits);
			}

			let underscoreSplit = match_.split('_');
			if (underscoreSplit.length > 1) {
				terms.push(...underscoreSplit);
			}

			let numberSuffixMatch = match_.match(this.numericPattern);
			numberSuffixMatch && terms.push(numberSuffixMatch[1]);

			for (let term of terms) {
				if (term.length > 2 && /[\p{Alphabetic}_$]{3,}/gu.test(term)) {
					uniqueTerms.add(term.toLowerCase());
				}
			}

			yield* uniqueTerms;
		}
	}

	static syncSplitTerms(input: string): string[] {
		const terms = TermSplitter.splitTerms(input);
		const result = [];

		for (let term of terms) {
			result.push(term);
		}

		return result;
	}
}
