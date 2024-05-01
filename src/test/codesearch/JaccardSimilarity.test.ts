import { expect } from 'chai';
import { JaccardSimilarity } from "../../code-search/similar/algorithm/JaccardSimilarity";

describe('JaccardSimilarity', () => {
    let jaccardSimilarity: JaccardSimilarity;

    beforeEach(() => {
        jaccardSimilarity = new JaccardSimilarity();
    });

    describe('tokenLevelJaccardSimilarity', () => {
        it('should return correct similarity scores', () => {
            const query = 'test query';
            const chunks = [['test', 'query'], ['another', 'test'], ['query', 'test']];
            const result = jaccardSimilarity.tokenLevelJaccardSimilarity(query, chunks);
            expect(result).to.be.an('array');
            expect(result[0][0]).to.be.closeTo(0.5, 0.5);
            expect(result[1][0]).to.be.closeTo(0, 0.05);
            expect(result[2][0]).to.be.closeTo(0.5, 0.5);
        });
    });

    describe('tokenize', () => {
        it('should return a set of tokens', () => {
            const input = 'test input';
            const result = jaccardSimilarity['tokenize'](input);
            expect(result).to.be.instanceOf(Set);
            expect(result.size).to.equal(2);
        });
    });

    describe('similarityScore', () => {
        it('should return correct similarity score', () => {
            const set1 = new Set(['test', 'query']);
            const set2 = new Set(['query', 'another']);
            const result = jaccardSimilarity['similarityScore'](set1, set2);
            expect(result).to.be.closeTo(0.33, 0.01);
        });
    });
});
