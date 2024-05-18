import { ChunkItem, Embedding } from "../../embedding/_base/Embedding";
import { HydeDocument, HydeDocumentType } from "./HydeDocument";
import { StrategyOutput } from "./StrategyOutput";

export type HydeQuery = string | RegExp | Embedding;

/**
 * The `HydeStrategy` interface is a part of the Hypothetical Document Search / Embedding (Hyde) Strategy for Code Search.
 * It is designed to create hypothetical documents from user input, convert these documents to embeddings, and use these embeddings to retrieve similar documents.
 *
 * The `HydeStrategy` interface is generic and can be used with any type `T`.
 *
 * The interface includes the following methods:
 *
 * - `instruction`: This method is a prompt for executing by LLM. It does not take any parameters and returns a string.
 *
 * - `createDocument`: This method is used to generate a Hyde document. The document can be Code, Keyword[], or any text. It does not take any parameters and returns a `HydeDocument` of type `T`.
 *
 * - `embedDocument`: This method is used to convert a Hyde document to an embedding. It takes a `HydeDocument` of type `T` as a parameter and returns an `Embedding`.
 *
 * - `retrieveChunks`: This method is used to retrieve the most relevant code snippets based on a given condition. It takes a `Query` as a parameter and returns an array of `ChunkItem`.
 *
 * Generate hypothetical document for query, and then embed that.
 *
 * Based on https://arxiv.org/abs/2212.10496
 *
 * Also can refer to the Unit Mesh SDK documentation: https://framework.unitmesh.cc/patterns/hyde.html
 */
export interface HydeStrategy<T> {
	query: string;

	documentType: HydeDocumentType;
	/**
	 * the Instruction prompt for executing by LLM;
	 */
	instruction: () => Promise<string>;

	/**
	 * Generate Hyde doc can be Code, Keyword[], or any text,
	 * In some cases can be extract_keywords,
	 * For more, see example in https://github.com/ianhojy/auto-hyde/blob/main/src/auto_hyde.py
	 */
	generateDocument: () => Promise<HydeDocument<T>>;

	/**
	 * Retrieve the most relevant code snippets based on the given condition
	 * @param condition - The condition to be used for retrieval
	 * @returns The most relevant code snippets
	 */
	retrieveChunks: (condition: HydeQuery) => Promise<ChunkItem[]>

	/**
	 * Retrieve the most relevant code snippets based on the given condition
	 * It can be:
	 * - Lost in the middle link, ReRank the code snippets
	 * @param docs - The documents to be used for retrieval
	 * @returns The most relevant code snippets
	 */
	clusterChunks: (docs: ChunkItem[]) => Promise<ChunkItem[]>;

	/**
	 * Executes the method and returns a Promise that resolves with a StrategyOutput object.
	 */
	execute(): Promise<StrategyOutput>;
}

