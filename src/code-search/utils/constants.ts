export const MAX_CHUNK_SIZE = 500; // 512 - buffer for safety (in case of differing tokenizers)

export const RETRIEVAL_PARAMS = {
	rerankThreshold: 0.3,
	nFinal: 10,
	nRetrieve: 20,
	bm25Threshold: -2.5,
};
