import { SettingService } from "../settings/SettingService";
import { OpenAICompletion } from "./OpenAICompletion";

export class LlmProvider {
	public static codeCompletion(): OpenAICompletion {
		const llmConfig = SettingService.instance().getCodeCompletionConfig();
		return new OpenAICompletion(llmConfig);
	}

	public static chatCompletion(): OpenAICompletion {
		const llmConfig = SettingService.instance().getChatCompletionConfig();
		return new OpenAICompletion(llmConfig);
	}
}