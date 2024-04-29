import { TfIdfWithSemanticChunkSearch } from "../../code-search/search/TfIdfWithSemanticChunkSearch";

describe('TfIdfWithSemanticChunkSearch', () => {
	describe('splitTerms', () => {
		it('should split terms correctly', () => {
			const input = 'HelloWorld_helloWorld123';
			const expectedOutput: string[] = ['helloworld_helloworld123', 'hello', 'world_hello', 'world123', 'helloworld',
				'helloworld123', 'helloworld_helloworld'];

			const generator = TfIdfWithSemanticChunkSearch.splitTerms(input);
			const output = Array.from(generator);
			expect(output).to.deep.equal(expectedOutput);
		});

		it('should handle empty string', () => {
			const input = '';
			const expectedOutput: string[] = [];
			const generator = TfIdfWithSemanticChunkSearch.splitTerms(input);
			const output = Array.from(generator);
			expect(output).to.deep.equal(expectedOutput);
		});

		it('should handle string with no terms to split', () => {
			const input = 'hello';
			const expectedOutput: string[] = ['hello'];
			const generator = TfIdfWithSemanticChunkSearch.splitTerms(input);
			const output = Array.from(generator);
			expect(output).to.deep.equal(expectedOutput);
		});

		it('should handle string with special characters', () => {
			const input = 'hello_world$123';
			const expectedOutput: string[] = ['hello_world$123', 'hello', 'world$123', 'hello_world$'];
			const generator = TfIdfWithSemanticChunkSearch.splitTerms(input);
			const output = Array.from(generator);
			expect(output).to.deep.equal(expectedOutput);
		});
	});
});
