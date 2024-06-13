export interface CodeTokenizer {
	tokenize(input: string): Set<string>;
}
