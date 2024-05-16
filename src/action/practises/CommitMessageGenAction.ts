import { Git } from "../../types/git";
import vscode, { InputBox } from "vscode";
import { GitAction } from "../../editor-api/scm/GitAction";
import { LlmProvider } from "../../../llm-provider/LlmProvider";
import { CustomActionPrompt } from "../../../prompt-manage/custom-action/CustomActionPrompt";
import { PromptManager } from "../../../prompt-manage/PromptManager";
import { ActionType } from "../../../prompt-manage/ActionType";
import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";
import { AutoDevStatus, AutoDevStatusManager } from "../../editor-api/AutoDevStatusManager";

export class CommitMessageGenAction {
	extension: vscode.Extension<Git>;

	constructor(extension?: vscode.Extension<Git>) {
		if (extension) {
			this.extension = extension;
		} else {
			this.extension = vscode.extensions.getExtension('vscode.git')!!;
		}
	}

	async handleDiff(inputBox: InputBox) {
		let diff = await new GitAction().getDiff();

		console.info("diff: ", JSON.stringify(diff));

		let context: CommitMessageTemplateContext = {
			language: "",
			historyExamples: [],
			diffContent: diff
		};

		let instruction = await PromptManager.getInstance().generateInstruction(ActionType.GenCommitMessage, context);
		const messages = CustomActionPrompt.parseChatMessage(instruction);
		let chatResponseStream = LlmProvider.codeCompletion()._streamChat(messages);

		inputBox.value = "";

		AutoDevStatusManager.instance.setStatus(AutoDevStatus.InProgress);
		try {
			for await (const chunk of chatResponseStream) {
				inputBox.value += chunk.content;
			}

			AutoDevStatusManager.instance.setStatus(AutoDevStatus.Done);
		} catch (e) {
			console.error(e);
			AutoDevStatusManager.instance.setStatus(AutoDevStatus.Error);
		}
	}
}

export interface CommitMessageTemplateContext extends TemplateContext {
	historyExamples: string[];
	diffContent: string;
}