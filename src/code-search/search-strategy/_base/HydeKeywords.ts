export class HydeKeywords {
	question: string = '';
	basic: string[] = [];
	single: string[] = [];
	localization: string[] = [];

	constructor(question: string, basic: string[], single: string[], localization: string[]) {
		this.question = question;
		this.basic = basic;
		this.single = single;
		this.localization = localization;
	}

	/**
	 * Parse string keyword to array, for example, input string
	 * "
	 * - calculate average, average, average calculation
	 * - calculate, average
	 * - jisuan, pingjunshu, pingjun
	 * "
	 * output will be: {@link HydeKeywords}
	 * ```
	 * {
	 *   "basic": ["calculate average", "average", "average calculation"],
	 *   "single": ["calculate", "average"],
	 *   "localization": ["jisuan", "pingjunshu", "pingjun"
	 * }
	 * ```
	 */
	static from(content: string): HydeKeywords {
		// first line is the question
		let question = '';
		// get first line without leading and trailing whitespaces, and not starting with '-'
		const questionRegex = /^([^-\n].*)$/gm;
		let questionMatch;
		if ((questionMatch = questionRegex.exec(content)) !== null) {
			question = questionMatch[1];
		}

		const regex = /-\s*([^,\n]+(?:,[^,\n]+)*)/g;
		let match;

		let basic: string[] = [];
		let single: string[] = [];
		let localization: string[] = [];

		let i = 0;
		while ((match = regex.exec(content)) !== null) {
			const keywords: string[] = match[1].split(',').map(word => word.trim());

			switch (i) {
				case 0:
					basic = keywords;
					break;
				case 1:
					single = keywords;
					break;
				case 2:
					localization = keywords;
					break;
			}
			i++;
		}

		return new HydeKeywords(question, basic, single, localization);
	}
}
