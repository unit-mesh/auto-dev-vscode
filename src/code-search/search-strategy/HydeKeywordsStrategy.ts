import { executeIns, HydeQuery, HydeStrategy } from "./_base/HydeStrategy";
import { ChunkItem } from "../embedding/_base/Embedding";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";
import { PromptManager } from "../../prompt-manage/PromptManager";
import { TemplateContext } from "../../prompt-manage/template/TemplateContext";
import { HydeStep } from "./_base/HydeStep";
import { ChatMessage } from "../../llm-provider/ChatMessage";
import { HydeKeywords } from "./_base/HydeKeywords";
import { DefaultRetrieval } from "../retrieval/DefaultRetrieval";
import { AutoDevExtension } from "../../AutoDevExtension";
import { channel } from "../../channel";
import { RetrieveOption } from "../retrieval/Retrieval";
import { StrategyFinalPrompt } from "./_base/StrategyFinalPrompt";
import { ContextItem } from "../../context-provider/_base/BaseContextProvider";

/**
 * The `HydeKeywordsStrategy` class is a part of the Hyde Strategy pattern and is used to generate keywords from a query.
 * These keywords are then used to retrieve similar code by symbols.
 *
 * The class prioritizes the text code, also known as TextDocument, in the following order:
 * - High: Current Document
 * - Medium: Recently Documents
 * - Low: All Documents
 */
export class HydeKeywordsStrategy implements HydeStrategy<HydeKeywords> {
	documentType = HydeDocumentType.Keywords;
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
		let chatContext = await PromptManager.getInstance().collectByCurrentDocument();
		let proposeContext: KeywordsProposeContext = {
			step: this.step,
			question: this.query,
			language: "",
			chatContext: chatContext.map(item => item.text).join("\n - ")
		};

		return await PromptManager.getInstance().renderHydeTemplate(this.step, this.documentType, proposeContext);
	}

	async generateDocument(): Promise<HydeDocument<HydeKeywords>> {
		let proposeIns = await this.instruction();
		channel.appendLine(" --- Generated keyword --- ");
		let proposeOut = await executeIns(proposeIns);
		let keywords = HydeKeywords.from(proposeOut);
		return new HydeDocument<HydeKeywords>(this.documentType, keywords);
	}

	async retrieveChunks(queryTerm: HydeQuery): Promise<ChunkItem[]> {
		let language = undefined;
		let embeddingsProvider = this.extension.embeddingsProvider!!;
		let retrieval = DefaultRetrieval.getInstance();
		let options: RetrieveOption = {
			filterDirectory: undefined,
			filterLanguage: language,
			withFullTextSearch: true,
			withSemanticSearch: true,
			withCommitMessageSearch: true,
		};

		let result: ContextItem[] = await retrieval.retrieve(
			queryTerm as string, this.extension.ideAction, embeddingsProvider, options
		);

		let chunks: ChunkItem[] = [];
		result.forEach((item: ContextItem) => {
			chunks.push({
				name: item.name,
				text: item.content,
				path: item.path,
				range: item.range,
				embedding: []
			});
		});

		return chunks;
	}

	async clusterChunks(docs: ChunkItem[]): Promise<ChunkItem[]> {
		return docs;
	}

	async execute() : Promise<StrategyFinalPrompt> {
		channel.appendLine("=".repeat(80));
		channel.appendLine(`= Hyde Keywords Strategy: ${this.constructor.name} =`);
		channel.appendLine("=".repeat(80));

		this.step = HydeStep.Propose;
		let documents = await this.generateDocument();
		let keywords = documents.content;

		this.step = HydeStep.Retrieve;
		let queryTerm = this.createQueryTerm(keywords);
		let chunkItems = await this.retrieveChunks(queryTerm);

		this.step = HydeStep.Evaluate;
		let evaluateContext: KeywordEvaluateContext = {
			step: this.step,
			question: keywords.question,
			code: chunkItems.map(item => item.text).join("\n"),
			language: ""
		};

		if (chunkItems.length === 0) {
			channel.appendLine("No code snippets found.");
			return new StrategyFinalPrompt("", []);
		}

		channel.appendLine("\n");
		channel.appendLine(" --- Summary --- ");
		let evaluateIns = await PromptManager.getInstance().renderHydeTemplate(this.step, this.documentType, evaluateContext);
		return new StrategyFinalPrompt(evaluateIns, chunkItems);
	}

	private createQueryTerm(keywords: HydeKeywords) {
		return keywords.basic?.[0] + " " + keywords.single?.[0] + " " + keywords.localization?.[0];
	}
}

export interface KeywordsProposeContext extends TemplateContext {
	step: HydeStep,
	question: string,
	chatContext: string
}

export interface KeywordEvaluateContext extends TemplateContext {
	step: HydeStep,
	question: string,
	code: string,
}
