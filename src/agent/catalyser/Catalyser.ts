import { ContextItem, retrieveContextItems } from "../../code-search/retrieval/DefaultRetrieval";
import { AutoDevExtension } from "../../AutoDevExtension";
import { channel } from "../../channel";
import { PromptManager } from "../../prompt-manage/PromptManager";
import { HydeStep } from "../../code-search/search-strategy/_base/HydeStep";
import { HydeDocumentType } from "../../code-search/search-strategy/_base/HydeDocument";
import { TemplateContext } from "../../prompt-manage/template/TemplateContext";
import { CustomActionPrompt } from "../../prompt-manage/custom-action/CustomActionPrompt";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor/editor-api/AutoDevStatusManager";
import { LlmProvider } from "../../llm-provider/LlmProvider";
import { RankedKeywords } from "../../code-search/search-strategy/utils/RankedKeywords";

export class Catalyser {
	private static instance: Catalyser;
	private extension: AutoDevExtension;

	private constructor(extension: AutoDevExtension) {
		this.extension = extension;
	}

	/**
	 * Get the instance of the Catalyser.
	 */
	static getInstance(extension: AutoDevExtension): Catalyser {
		if (!Catalyser.instance) {
			Catalyser.instance = new Catalyser(extension);
		}
		return Catalyser.instance;
	}

	async query(query: string): Promise<void> {
		channel.append("Semantic search for code: " + query + "\n");
		// query propose.vm
		let step = HydeStep.Propose;
		let instance = PromptManager.getInstance();
		let proposeContext: KeywordsProposeContext =  {
			question: query,
			language: ""
		};
		let proposeIns = await instance.renderHydeTemplate(step, HydeDocumentType.Keywords, proposeContext);
		let proposeOutput = await this.executeIns(proposeIns);

		let keywords = RankedKeywords.from(proposeOutput);

		let result: ContextItem[] = await retrieveContextItems(query, this.extension.ideAction, this.extension.embeddingsProvider!!, undefined);
		result.forEach((item: ContextItem) => {
			channel.appendLine(JSON.stringify(item));
		});
	}


	async executeIns(instruction: string): Promise<string> {
		let result = "";
		try {
			let chatMessages = CustomActionPrompt.parseChatMessage(instruction);
			AutoDevStatusManager.instance.setStatus(AutoDevStatus.InProgress);
			let response = await LlmProvider.instance()._streamChat(chatMessages);
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
}

export interface KeywordsProposeContext extends TemplateContext {
	question: string,
}