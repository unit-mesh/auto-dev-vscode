import { StopwordsBasedTokenizer } from "../../code-search/tokenizer/StopwordsBasedTokenizer";

describe('SimilarChunkTokenizer', () => {
	let tokenizer: StopwordsBasedTokenizer;

	beforeEach(() => {
		tokenizer = StopwordsBasedTokenizer.instance();
	});

	describe('instance', () => {
		it('should return an instance of SimilarChunkTokenizer', () => {
			expect(tokenizer).to.be.instanceOf(StopwordsBasedTokenizer);
		});

		it('should always return the same instance', () => {
			const anotherInstance = StopwordsBasedTokenizer.instance();
			expect(anotherInstance).to.equal(tokenizer);
		});
	});

	describe('tokenize', () => {
		it('should return a set of unique words from the input string, excluding stop words and programming keywords', () => {
			const input = 'this is a test function for SimilarChunkTokenizer';
			const expectedOutput = new Set(['chunk', 'similar', 'tokenizer', 'test', 'similarchunktokenizer']);
			expect(tokenizer.tokenize(input)).to.deep.equal(expectedOutput);
		});

		// java hello world
		it('should split the input string into an array of words', () => {
			const input = `public class HelloWorld {
      public static void main(String[] args) {
          System.out.println("Hello, World");
      }
  }`;
			const expectedOutput: Set<string> = new Set([
				"helloworld",
				"void",
				"main",
				"string",
				"args",
				"system",
				"println",
				"hello",
				"world"
			]);
			expect(tokenizer.tokenize(input)).to.deep.equal(expectedOutput);
		});
	});

	describe('splitIntoWords', () => {
		it('should split the input string into an array of words', () => {
			const input = 'this is a test';
			const expectedOutput = ['this', 'is', 'a', 'test'];
			expect(tokenizer.splitIntoWords(input)).to.deep.equal(expectedOutput);
		});
	});
});
