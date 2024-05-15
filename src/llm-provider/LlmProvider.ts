import { SettingService } from "../settings/SettingService";
import { OpenAICompletion } from "./OpenAICompletion";

export enum LlmStrategy {
	Normal = "normal",
	HighQuality = "high-quality",
	HighSpeed = "high-speed"
}

export class LlmProvider {
	public static codeCompletion(strategy: LlmStrategy = LlmStrategy.HighSpeed): OpenAICompletion {
		const llmConfig = SettingService.instance().getCodeCompletionConfig();
		return new OpenAICompletion(llmConfig);
	}

	public static chatCompletion(strategy: LlmStrategy = LlmStrategy.Normal): OpenAICompletion {
		const llmConfig = SettingService.instance().getChatCompletionConfig();
		return new OpenAICompletion(llmConfig);
	}
}
