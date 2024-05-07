import { HydeQuery, HydeStrategy } from "./_base/HydeStrategy";
import { ChunkItem, Embedding } from "../embedding/_base/Embedding";
import { HydeDocument, HydeDocumentType } from "./_base/HydeDocument";
import { PromptManager } from "../../prompt-manage/PromptManager";
import { TemplateContext } from "../../prompt-manage/template/TemplateContext";
import { HydeStep } from "./_base/HydeStep";


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
export class HydeKeywordsStrategy implements HydeStrategy<string[]> {
	documentType = HydeDocumentType.Keywords;
	private promptManager = PromptManager.getInstance();

	constructor() {

	}

	async instruction(userInput: string): Promise<string> {
		const context: KeywordTemplateContext = {
			language: "",
			userInput: userInput
		};

		return await this.promptManager.getHydeTemplate(HydeStep.Propose, this.documentType, context);
	}

	embedDocument(doc: HydeDocument<string[]>): Embedding {
		return [];
	}

	generateDocument(): HydeDocument<string[]> {
		return new HydeDocument(HydeDocumentType.Code, []);
	}

	retrieveChunks(condition: HydeQuery): ChunkItem[] {
		return [];
	}

	clusterChunks(docs: HydeDocument<string[]>[]): Embedding[] {
		return [];
	}

	/**
	 * Parse string keyword to array, for example:
	 *
	 * input the string "['a', 'b', 'c', 'd']",
	 * output will be: ['a', 'b', 'c', 'd']
	 *
	 */
	parseKeywords(content: string): string[] {
		return JSON.parse(content);
	}
}
