import { InteractionType } from "../../custom-action/InteractionType";
import { TemplateRoleSplitter } from "./TemplateRoleSplitter";
import { ChatMessage, ChatRole } from "../../llm-provider/ChatMessage";

export enum CustomActionType {
	Default,
	QuickAction,
}

export class CustomActionPrompt {
	interaction: InteractionType;
	priority: number;
	type: CustomActionType;
	other: { [key: string]: any };
	messages: ChatMessage[];
	pathmatch?: string;

	constructor(
		interaction: InteractionType = InteractionType.AppendCursorStream,
		priority: number = 0,
		type: CustomActionType = CustomActionType.Default,
		other: { [key: string]: any } = {},
		messages: ChatMessage[] = [],
		match?: string
	) {
		this.interaction = interaction;
		this.priority = priority;
		this.type = type;
		this.other = other;
		this.messages = messages;
		this.pathmatch = match;
	}

	/**
	 * Parses the given content and returns a TeamActionPrompt object.
	 *
	 * @param content The content to be parsed, which includes front-matter and chat messages.
	 * @return A TeamActionPrompt object containing the parsed information.
	 *
	 * Example usage:
	 * ```
	 * ---
	 * interaction: AppendCursorStream
	 * priority: 1
	 * key1: value1
	 * key2: value2
	 * ---
	 * ```system```
	 * Chat message 1
	 * ```user```
	 * Chat message 2
	 * ```
	 *
	 * This method parses the provided content and constructs a TeamActionPrompt object with the following properties:
	 * - interaction: The interaction type specified in the front-matter.
	 * - priority: The priority value specified in the front-matter.
	 * - other: A map containing any additional key-value pairs specified in the front-matter, excluding "interaction" and "priority".
	 * - msgs: A list of LlmMsg.ChatMessage objects representing the parsed chat messages.
	 *
	 * The content is expected to have a specific format. It should start with front-matter enclosed in triple dashes (---),
	 * followed by a newline, and then the chat messages. The front-matter should be in YAML format, with each key-value pair
	 * on a separate line. The chat messages should be enclosed in triple backticks (```) and should have a role specifier
	 * (e.g., "system" or "user") followed by the message content on a new line. Each chat message should be separated by a newline.
	 *
	 * If the content does not contain front-matter, the method assumes that the entire content is chat messages and parses it accordingly.
	 *
	 * Example:
	 * ```
	 * TeamActionPrompt(
	 *    interaction=AppendCursorStream,
	 *    priority=1,
	 *    other={key1=value1, key2=value2},
	 *    msgs=[
	 *    LlmMsg.ChatMessage(role=System, content=Chat message 1\n, cursor=null),
	 *    LlmMsg.ChatMessage(role=User, content=Chat message 2\n, cursor=null)
	 *   ]
	 * )
	 * ```
	 */
	static fromContent(content: string): CustomActionPrompt {
		const regex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
		const matchResult = content.match(regex);

		const prompt = new CustomActionPrompt();
		if (matchResult !== null) {
			const frontMatter = matchResult[1];
			const yaml = require('js-yaml');
			const frontMatterMap = yaml.load(frontMatter);

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
			prompt.messages = this.parseChatMessage(chatContent);
		} else {
			prompt.messages = this.parseChatMessage(content);
		}

		return prompt;
	}

	private static parseChatMessage(chatContent: string): ChatMessage[] {
		try {
			const messages = TemplateRoleSplitter.split(chatContent);
			return Object.entries(messages).map(([key, value]) => ({
				role: key as ChatRole,
				content: value
			}));
		} catch (e) {
			console.warn(`Failed to parse chat message: ${chatContent}`, e);
			return [{
				role: ChatRole.User,
				content: chatContent
			}];
		}
	}
}