import { ChunkItem } from "../embedding/_base/Embedding";
import { HydeQuery, HydeStrategy } from "./_base/HydeStrategy";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";
import { AutoDevExtension } from "../../AutoDevExtension";

/**
 * Generate hypothetical document base on user input, and then used to retrieve similar code by symbols.
 * Hypothetical Document Embedding (HyDE): https://arxiv.org/abs/2212.10496
 * This class generates synthetic documents based on the query. These are then parsed and code is extracted. This has
 * been shown to improve semantic search recall.
 *
 * First try semantic_search, if no results or few results, then try code_search.
 * In bloop, default will be:
 * ```rust
 * const CODE_SEARCH_LIMIT: u64 = 10;
 * const MINIMUM_RESULTS: usize = CODE_SEARCH_LIMIT as usize / 2;
 * ```
 *
 * Then, extract the Chunk with {@link NamedElement} and {extra_chunks} to class or function.
 * In bloop, function will be like:
 *
 * ```rust
 * let extra_chunks = match self.get_related_chunks(chunks.clone()).await {
 *     Ok(chunks) => chunks,
 *     Err(e) => {
 *         info!(?e, "failed to get related chunks");
 *         vec![]
 *     }
 * };
 * ```
 */
export class HydeCodeStrategy implements HydeStrategy<string> {
	documentType = HydeDocumentType.Code;
	query: string;
	extension: AutoDevExtension;

	constructor(query: string, extension: AutoDevExtension) {
		this.query = query;
		this.extension = extension;
	}

	instruction(): Promise<string> {
		return Promise.resolve("");
	}

	async generateDocument(): Promise<HydeDocument<string>> {
		return new HydeDocument(HydeDocumentType.Code, "");
	}

	async retrieveChunks(condition: HydeQuery): Promise<ChunkItem[]> {
		return [];
	}

	async clusterChunks(docs: ChunkItem[]): Promise<ChunkItem[]> {
		return [];
	}
}