import { HydeKeywords } from '../../../code-search/search-strategy/_base/HydeKeywords';

describe('RankedKeywords', () => {
	it('should parse keywords correctly', () => {
		const content = `
Where is calculating the average of a list of numbers?

- calculate average, average, average calculation
- calculate, average
- jisuan, pingjunshu, pingjun
`;

		const expected: HydeKeywords = {
			question: 'Where is calculating the average of a list of numbers?',
			basic: ['calculate average', 'average', 'average calculation'],
			single: ['calculate', 'average'],
			localization: ['jisuan', 'pingjunshu', 'pingjun'],
		};

		const result = HydeKeywords.from(content);
		expect(result).to.deep.equal(expected);
	});
});
