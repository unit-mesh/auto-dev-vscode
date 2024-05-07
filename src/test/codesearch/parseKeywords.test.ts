import { parseRankedKeywords, RankedKeywords } from "../../code-search/search-strategy/KeywordsUtils";

describe('HydeKeywordsStrategy', () => {
	it('should parse keywords correctly', () => {
		const content = `
- calculate average, average, average calculation
- calculate, average
- jisuan, pingjunshu, pingjun
`;

		const expected: RankedKeywords = {
			basic: ["calculate average", "average", "average calculation"],
			single: ["calculate", "average"],
			localization: ["jisuan", "pingjunshu", "pingjun"]
		};

		const result = parseRankedKeywords(content);
		expect(result).to.deep.equal(expected);
	});
});
