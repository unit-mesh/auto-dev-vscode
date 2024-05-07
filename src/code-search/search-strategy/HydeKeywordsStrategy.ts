import { HydeQuery, HydeStrategy } from "./_base/HydeStrategy";
import { ChunkItem, Embedding } from "../embedding/_base/Embedding";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";
import { PromptManager } from "../../prompt-manage/PromptManager";
import { TemplateContext } from "../../prompt-manage/template/TemplateContext";
import { HydeStep } from "./_base/HydeStep";
import { LlmProvider } from "../../llm-provider/LlmProvider";
import { CustomActionPrompt } from "../../prompt-manage/custom-action/CustomActionPrompt";
import { ChatMessage } from "../../llm-provider/ChatMessage";
import { RankedKeywords } from "./utils/RankedKeywords";


export interface KeywordTemplateContext extends TemplateContext {
	userInput: string;
}

/**
 * Generate keywords from the query, and then used to retrieve similar code by symbols.
 *
 * Should set prioritize for the text code aka {@link TextDocument}.

 * - High: Current Document
 * - Medium: Recently Documents
 * - Low: All Documents
 */
export class HydeKeywordsStrategy implements HydeStrategy<RankedKeywords> {
	documentType = HydeDocumentType.Keywords;
	private promptManager = PromptManager.getInstance();
	message: ChatMessage[] = [];

	constructor() {
	}

	async instruction(userInput: string): Promise<string> {
		const context: KeywordTemplateContext = {
			language: "",
			userInput: userInput
		};

		let content = await this.promptManager.getHydeTemplate(HydeStep.Propose, this.documentType, context);
		this.message = CustomActionPrompt.parseChatMessage(content);
		return content;
	}

	async embedDocument(doc: HydeDocument<RankedKeywords>): Promise<Embedding> {
		return [];
	}

	async generateDocument(): Promise<HydeDocument<RankedKeywords>> {
		let output = await LlmProvider.instance().chat(this.message);

		let keywords = RankedKeywords.from(output);

		return Promise.resolve(new HydeDocument(HydeDocumentType.Code, keywords));
	}

	async retrieveChunks(condition: HydeQuery): Promise<ChunkItem[]> {
		return [];
	}

	async clusterChunks(docs: HydeDocument<RankedKeywords>[]): Promise<Embedding[]> {
		return [];
	}
}