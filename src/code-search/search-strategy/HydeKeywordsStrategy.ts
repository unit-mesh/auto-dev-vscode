import { HydeQuery, HydeStrategy } from "./_base/HydeStrategy";
import { ChunkItem } from "../embedding/_base/Embedding";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";
import { PromptManager } from "../../prompt-manage/PromptManager";
import { TemplateContext } from "../../prompt-manage/template/TemplateContext";
import { HydeStep } from "./_base/HydeStep";
import { ChatMessage } from "../../llm-provider/ChatMessage";
import { HydeKeywords } from "./_base/HydeKeywords";
import { DefaultRetrieval } from "../retrieval/DefaultRetrieval";
import { AutoDevExtension } from "../../AutoDevExtension";
import { CustomActionPrompt } from "../../prompt-manage/custom-action/CustomActionPrompt";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor/editor-api/AutoDevStatusManager";
import { LlmProvider } from "../../llm-provider/LlmProvider";
import { channel } from "../../channel";
import { TextRange } from "../scope-graph/model/TextRange";
import { LocalEmbeddingProvider } from "../embedding/LocalEmbeddingProvider";
import { ContextItem, RetrieveOption } from "../retrieval/Retrieval";
import { StrategyOutput } from "./_base/StrategyOutput";

export async function executeIns(instruction: string) {
	console.log("\ninstruction: \n" + instruction);
	let result = "";
	try {
		let chatMessages = CustomActionPrompt.parseChatMessage(instruction);
		AutoDevStatusManager.instance.setStatus(AutoDevStatus.InProgress);
		let response = await LlmProvider.codeCompletion()._streamChat(chatMessages);
		for await (let chatMessage of response) {
			channel.append(chatMessage.content);
			result += chatMessage.content;
		}

		AutoDevStatusManager.instance.setStatus(AutoDevStatus.Done);
		return result;
	} catch (e) {
		console.log("error:" + e);
		AutoDevStatusManager.instance.setStatus(AutoDevStatus.Error);
		return "";
	}
}

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

	async execute() : Promise<StrategyOutput> {
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

		channel.appendLine("\n");
		channel.appendLine(" --- Summary --- ");
		let evaluateIns = await PromptManager.getInstance().renderHydeTemplate(this.step, this.documentType, evaluateContext);
		return new StrategyOutput(await executeIns(evaluateIns), chunkItems);
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
