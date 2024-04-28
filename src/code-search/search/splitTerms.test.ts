import { expect } from 'chai';
import { TfIdfWithSemanticChunkSearch } from '/Volumes/source/ai/auto-dev-vscode/src/code-search/search/TfIdfWithSemanticChunkSearch';

describe('TfIdfWithSemanticChunkSearch', () => {
  describe('splitTerms', () => {
    it('should split terms correctly', () => {
      const input = 'HelloWorld_helloWorld123';
      const expectedOutput: string[] = ['HelloWorld', 'helloWorld123', 'Hello', 'World', 'hello', 'World123', 'hello', 'World'];
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
      const expectedOutput: string[] = ['hello_world$123', 'hello', 'world$123'];
      const generator = TfIdfWithSemanticChunkSearch.splitTerms(input);
      const output = Array.from(generator);
      expect(output).to.deep.equal(expectedOutput);
    });
  });
});
