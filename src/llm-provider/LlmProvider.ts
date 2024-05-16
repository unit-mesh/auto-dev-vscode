import { SettingService } from "../settings/SettingService";
import { OpenAICompletion } from "./OpenAICompletion";

export enum LlmStrategy {
	Normal = "normal",
	HighQuality = "high-quality",
	HighSpeed = "high-speed",
	LongContext = "long-context",
}

export class LlmProvider {
	public static codeCompletion(strategy: LlmStrategy = LlmStrategy.HighSpeed): OpenAICompletion {
		const llmConfig = SettingService.instance().getCodeCompletionConfig();
		return new OpenAICompletion(llmConfig);
	}

	public static chatCompletion(strategy: LlmStrategy = LlmStrategy.Normal): OpenAICompletion {
		const llmConfig = SettingService.instance().getChatCompletionConfig();
		// dynamic strategy

		// based on https://platform.openai.com/docs/models/gpt-3-5-turbo
		// there will be same model for high-quality and high-speed, and maybe gpt-4-turbo for 128k?
		if (llmConfig.baseURL?.includes("https://api.openai.com/")) {
			switch (strategy) {
				case LlmStrategy.HighQuality:
					llmConfig.model = "gpt-3.5-turbo";
					break;
				case LlmStrategy.HighSpeed:
					llmConfig.model = "gpt-3.5-turbo";
					break;
				case LlmStrategy.LongContext:
					llmConfig.model = "gpt-3.5-turbo";
					break;
			}
		}

		return new OpenAICompletion(llmConfig);
	}
}
