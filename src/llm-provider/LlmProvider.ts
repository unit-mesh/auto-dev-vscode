import { SettingService } from "../settings/SettingService";
import { LlmConfig } from "../settings/LlmConfig";
import { OpenAICompletion } from "./OpenAICompletion";

export class LlmProvider {
	public static instance(): OpenAICompletion {
		const llmConfig = SettingService.instance().getCodeCompletionConfig();
		return new OpenAICompletion(llmConfig);
	}
}