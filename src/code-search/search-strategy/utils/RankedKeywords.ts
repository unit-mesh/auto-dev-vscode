export class RankedKeywords {
	basic: string[] = [];
	single: string[] = [];
	localization: string[] = [];

	constructor(basic: string[], single: string[], localization: string[]) {
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
	 * output will be: {@link RankedKeywords}
	 * ```
	 * {
	 *   "basic": ["calculate average", "average", "average calculation"],
	 *   "single": ["calculate", "average"],
	 *   "localization": ["jisuan", "pingjunshu", "pingjun"
	 * }
	 * ```
	 */
	static from(content: string): RankedKeywords {
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

		return new RankedKeywords(basic, single, localization);
	}
}
