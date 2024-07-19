import { StopwordsBasedTokenizer } from "../../tokenizer/StopwordsBasedTokenizer";

export abstract class Similarity {
	tokenize(input: string): Set<string> {
		return StopwordsBasedTokenizer.instance().tokenize(input);
	}

	abstract computeInputSimilarity(query: string, chunks: Array<Array<string>>): Array<Array<number>>;
}
