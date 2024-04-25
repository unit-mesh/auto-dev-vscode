import { CustomActionVariable } from "./CustomActionVariable";
import { LlmProvider } from "../../llm-provider/LlmProvider";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor/editor-api/AutoDevStatusManager";
import { FencedCodeBlock } from "../../markdown/FencedCodeBlock";
import { ChatMessage, ChatRole } from "../../llm-provider/ChatMessage";

export class CustomActionExecutor {
	public async execute(context: CustomActionVariable): Promise<string> {
		const content = "";
		console.info(`request: ${content}`);

		let msg: ChatMessage = {
			role: ChatRole.User,
			content: content
		};

		let llm = LlmProvider.instance();
		let doc: string = "";

		try {
			for await (const chunk of llm._streamChat([msg])) {
				doc += chunk.content;
			}
		} catch (e) {
			console.error(e);
			AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.Error);
			return Promise.reject(e);
		}
		console.info(`result: ${doc}`);

		AutoDevStatusManager.instance.setStatusBar(AutoDevStatus.Done);
		const finalText = FencedCodeBlock.parse(doc).text;

		console.info(`FencedCodeBlock parsed output: ${finalText}`);

		return finalText;
	}
}