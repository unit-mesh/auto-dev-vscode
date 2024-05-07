export interface RankedKeywords {
	basic: string[],
	single: string[],
	localization: string[]
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
export function parseRankedKeywords(content: string): RankedKeywords {
	const regex = /-\s*([^,\n]+(?:,[^,\n]+)*)/g;
	let match;
	let result: RankedKeywords = {
		basic: [],
		single: [],
		localization: []
	};

	let i = 0;
	while ((match = regex.exec(content)) !== null) {
		const keywords: string[] = match[1].split(',').map(word => word.trim());

		switch (i) {
			case 0:
				result.basic = keywords;
				break;
			case 1:
				result.single = keywords;
				break;
			case 2:
				result.localization = keywords;
				break;
		}
		i++;
	}
	return result;
}