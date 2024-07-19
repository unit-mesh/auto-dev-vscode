import { StopwordsBasedTokenizer } from "../../tokenizer/StopwordsBasedTokenizer";

export interface Similarity {
	computeInputSimilarity(query: string, chunks: Array<Array<string>>): Array<Array<number>>;
}

export abstract class TokenizedSimilarity implements Similarity {
	tokenize(input: string): Set<string> {
		return StopwordsBasedTokenizer.instance().tokenize(input);
	}

	abstract computeInputSimilarity(query: string, chunks: Array<Array<string>>): Array<Array<number>>;
}

