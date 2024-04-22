import { VSCodeTemplateLoader } from "./loader/VSCodeTemplateLoader";
import { TemplateRender } from "./template/TemplateRender";
import { TemplateContext } from "./template/TemplateContext";
import { LangEcotManager } from "../lang-eco-context/LangEcotManager";
import { LangEcoContextItem, LangEcoCreationContext } from "../lang-eco-context/LangEcoContextProvider";

export enum ActionType {
	AutoDoc,
	AutoTest,
}

export class PromptManager {
	private static _instance: PromptManager;
	private templateLoader: VSCodeTemplateLoader;

	private constructor() {
		this.templateLoader = new VSCodeTemplateLoader();
	}

	static getInstance(): PromptManager {
		if (!PromptManager._instance) {
			PromptManager._instance = new PromptManager();
		}
		return PromptManager._instance;
	}

	async chatContext(context: LangEcoCreationContext): Promise<LangEcoContextItem[]> {
		return LangEcotManager.instance().collectChatContextList(context);
	}

	async build(type: ActionType, context: TemplateContext): Promise<string> {
		let templateRender = new TemplateRender(this.templateLoader);
		let template: string;

		switch (type) {
			case ActionType.AutoDoc:
				template = await templateRender.getTemplate("prompts/genius/en/code/auto-doc.vm");
				break;
			case ActionType.AutoTest:
				template = await templateRender.getTemplate("prompts/genius/en/code/test-gen.vm");
				break;
		}

		return templateRender.render(template, context);
	}
}