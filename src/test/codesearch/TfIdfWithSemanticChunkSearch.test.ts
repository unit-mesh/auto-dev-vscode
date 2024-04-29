import { expect } from 'chai';
import { TfIdfSemanticChunkSearch } from '../../code-search/search/TfIdfSemanticChunkSearch';

describe('TfIdfWithSemanticChunkSearch', () => {
    let tfIdfWithSemanticChunkSearch: TfIdfSemanticChunkSearch;

    beforeEach(() => {
        tfIdfWithSemanticChunkSearch = new TfIdfSemanticChunkSearch();
    });

    describe('addDocument', () => {
        it('should add documents to the TfIdf instance', () => {
            const chunks = ['chunk1', 'chunk2', 'chunk3'];
            tfIdfWithSemanticChunkSearch.addDocument(chunks);
            expect(tfIdfWithSemanticChunkSearch['tfidf']['documents'].length).to.equal(chunks.length);
        });
    });

    describe('search', () => {
        it('should return TfIdf values for a given query', () => {
            const chunks = ['chunk1', 'chunk2', 'chunk3'];
            const query = 'chunk1';
            tfIdfWithSemanticChunkSearch.addDocument(chunks);
            const result = tfIdfWithSemanticChunkSearch.search(query);
            expect(result).to.be.an('array');
            expect(result[0]).to.be.a('number');
        });

        it('should execute the callback function if provided', (done) => {
            const chunks = ['chunk1', 'chunk2', 'chunk3'];
            const query = 'chunk1';
            tfIdfWithSemanticChunkSearch.addDocument(chunks);
            tfIdfWithSemanticChunkSearch.search(query, (i, measure) => {
                expect(i).to.be.a('number');
                expect(measure).to.be.a('number');
            });
        });
    });
});
