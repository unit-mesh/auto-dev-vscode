// @ts-ignore
import { Tiktoken, encodingForModel as _encodingForModel } from "js-tiktoken";
// @ts-ignore
import llamaTokenizer from "llama-tokenizer-js";

interface Encoding {
	encode: Tiktoken["encode"];
	decode: Tiktoken["decode"];
}

let gptEncoding: Encoding | null = null;


export function countTokens(
	content: any,
	// defaults to llama2 because the tokenizer tends to produce more tokens
	modelName: string = "llama2",
): number {
	// todo;
	// throw new Error("Not implemented");
	return 488;
}
