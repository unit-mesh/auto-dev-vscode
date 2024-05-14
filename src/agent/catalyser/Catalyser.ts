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
		let proposeContext: KeywordsProposeContext = {
			step,
			question: query,
			language: ""
		};
		let proposeIns = await instance.renderHydeTemplate(step, HydeDocumentType.Keywords, proposeContext);
		let proposeOutput = await this.executeIns(proposeIns);

		console.log(proposeIns);
		this.extension.sidebar.webviewProtocol?.request("userInput", {
			input: query,
		});

		let keywords = RankedKeywords.from(proposeOutput);
		let queryTerm = keywords.basic.join(" ");

		// todo: add remote semantic search
		step = HydeStep.Search;
		let result: ContextItem[] = await retrieveContextItems(queryTerm, this.extension.ideAction, this.extension.embeddingsProvider!!, undefined);

		console.log("Search results:");
		result.forEach((item: ContextItem) => {
			console.log(item);
		});

		console.log(`${step}:`);
		step = HydeStep.Evaluate;
		let evaluateContext: KeywordEvaluateContext = {
			step,
			question: query,
			code: result.map(item => item.content).join("\n"),
			language: ""
		};

		let evaluateIns = await instance.renderHydeTemplate(step, HydeDocumentType.Keywords, evaluateContext);

		console.log(evaluateIns);
		let evaluateOutput = await this.executeIns(evaluateIns);
		channel.appendLine("Summary: ");
		channel.append(evaluateOutput);

		this.extension.sidebar?.webviewProtocol?.request("userInput", {
			input: evaluateOutput,
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
	step: HydeStep,
	question: string,
}

export interface KeywordEvaluateContext extends TemplateContext {
	step: HydeStep,
	question: string,
	code: string,
}