import { InteractionType } from "../../custom-action/InteractionType";
import { TemplateRoleSplitter } from "./TemplateRoleSplitter";
import { ChatMessage, ChatRole, LlmMsg } from "../../llm-provider/LlmMsg";

export enum CustomActionType {
	Default,
	QuickAction,
}

export class CustomActionPrompt {
	interaction: InteractionType;
	priority: number;
	type: CustomActionType;
	other: { [key: string]: any };
	msgs: ChatMessage[];

	constructor(
		interaction: InteractionType = InteractionType.AppendCursorStream,
		priority: number = 0,
		type: CustomActionType = CustomActionType.Default,
		other: { [key: string]: any } = {},
		msgs: ChatMessage[] = []
	) {
		this.interaction = interaction;
		this.priority = priority;
		this.type = type;
		this.other = other;
		this.msgs = msgs;
	}

	static fromContent(content: string): CustomActionPrompt {
		const regex = /^---\s*\n(.*?)\n---\s*\n([\s\S]*)$/;
		const matchResult = content.match(regex);

		const prompt = new CustomActionPrompt();
		if (matchResult !== null) {
			const frontMatter = matchResult[1];
			const yaml = require('js-yaml');
			const frontMatterMap = yaml.safeLoad(frontMatter);

			prompt.interaction = frontMatterMap["interaction"] ? InteractionType[frontMatterMap["interaction"] as keyof typeof InteractionType] : InteractionType.AppendCursorStream;
			prompt.priority = frontMatterMap["priority"] ? parseInt(frontMatterMap["priority"]) : 0;
			prompt.type = frontMatterMap["type"] ? CustomActionType[frontMatterMap["type"] as keyof typeof CustomActionType] : CustomActionType.Default;

			prompt.other = Object.keys(frontMatterMap)
				.filter(key => key !== "interaction" && key !== "priority" && key !== "type")
				.reduce((acc: any, key) => {
					acc[key] = frontMatterMap[key];
					return acc;
				}, {});

			const chatContent = matchResult[2];
			prompt.msgs = this.parseChatMessage(chatContent);
		} else {
			prompt.msgs = this.parseChatMessage(content);
		}

		return prompt;
	}

	private static parseChatMessage(chatContent: string): ChatMessage[] {
		try {
			const msgs = TemplateRoleSplitter.split(chatContent);
			// return msgs.map(msg => LlmMsg.fromMap(msg));
			return Object.entries(msgs).map(([key, value]) => ({
				role: key as ChatRole,
				content: value,
				name: null
			}));
		} catch (e) {
			console.warn(`Failed to parse chat message: ${chatContent}`, e);
			// return [new ChatMessage(ChatRole.User, chatContent, null)];
			return [{
				role: ChatRole.User,
				content: chatContent,
				name: null
			}];
		}
	}
}