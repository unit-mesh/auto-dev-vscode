import { ChunkItem } from "../embedding/_base/Embedding";
import { HydeQuery, HydeStrategy } from "./_base/HydeStrategy";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";
import { AutoDevExtension } from "../../AutoDevExtension";
import { ChatMessage } from "../../llm-provider/ChatMessage";
import { HydeStep } from "./_base/HydeStep";
import { PromptManager } from "../../prompt-manage/PromptManager";
import { QuestionKeywords } from "./utils/QuestionKeywords";
import { channel } from "../../channel";
import { LocalEmbeddingProvider } from "../embedding/LocalEmbeddingProvider";
import { DefaultRetrieval } from "../retrieval/DefaultRetrieval";
import { ContextItem, RetrieveOption } from "../retrieval/Retrieval";
import { TextRange } from "../scope-graph/model/TextRange";
import { executeIns, KeywordEvaluateContext, KeywordsProposeContext } from "./HydeKeywordsStrategy";
import { StreamingMarkdownCodeBlock } from "../../markdown/StreamingMarkdownCodeBlock";

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
	message: ChatMessage[] = [];
	query: string;
	extension: AutoDevExtension;
	step: HydeStep;

	constructor(query: string, extension: AutoDevExtension) {
		this.query = query;
		this.extension = extension;
		this.step = HydeStep.Propose;
	}

	async instruction(): Promise<string> {
		let proposeContext: KeywordsProposeContext = {
			step: this.step,
			question: this.query,
			language: ""
		};

		return await PromptManager.getInstance().renderHydeTemplate(this.step, this.documentType, proposeContext);
	}

	async generateDocument(): Promise<HydeDocument<string>> {
		let proposeIns = await this.instruction();
		channel.appendLine(" --- Generated Code --- ");
		const proposeOut = await executeIns(proposeIns);
		const code = StreamingMarkdownCodeBlock.parse(proposeOut);
		return new HydeDocument<string>(this.documentType, code.text);
	}

	async retrieveChunks(queryTerm: HydeQuery): Promise<ChunkItem[]> {
		let language = undefined;
		let embeddingsProvider = this.extension.embeddingsProvider ?? LocalEmbeddingProvider.getInstance();
		let retrieval = DefaultRetrieval.getInstance();
		let options: RetrieveOption = {
			filterDirectory: undefined,
			filterLanguage: language,
			withFullTextSearch: true,
			withSemanticSearch: true,
		};

		let result: ContextItem[] = await retrieval.retrieve(
			queryTerm as string, this.extension.ideAction, embeddingsProvider, options
		);

		let chunks: ChunkItem[] = [];
		result.forEach((item: ContextItem) => {
			chunks.push({
				text: item.content,
				file: item.name,
				range: TextRange.empty(),
				embedding: []
			});
		});

		return chunks;
	}

	async clusterChunks(docs: ChunkItem[]): Promise<ChunkItem[]> {
		return docs;
	}

	async execute() {
		channel.appendLine("=".repeat(80));
		channel.appendLine(`= Hyde Keywords Strategy: ${this.constructor.name} =`);
		channel.appendLine("=".repeat(80));

		this.step = HydeStep.Propose;
		let documents = await this.generateDocument();
		let hydeCode = documents.content;

		this.step = HydeStep.Retrieve;
		let chunks = await this.retrieveChunks(hydeCode);

		this.step = HydeStep.Evaluate;
		let evaluateContext: KeywordEvaluateContext = {
			step: this.step,
			question: this.query,
			code: chunks.map(item => item.text).join("\n"),
			language: ""
		};

		channel.appendLine("\n");
		channel.appendLine(" --- Summary --- ");
		let evaluateIns = await PromptManager.getInstance().renderHydeTemplate(this.step, this.documentType, evaluateContext);
		return await executeIns(evaluateIns);
	}
}