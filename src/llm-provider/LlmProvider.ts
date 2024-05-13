import { SettingService } from "../settings/SettingService";
import { LlmConfig } from "../settings/LlmConfig";
import { OpenAICompletion } from "./OpenAICompletion";

export class LlmProvider {
	private static instance_: LlmProvider;
	private llmConfig: LlmConfig;

	private constructor(llmConfig: LlmConfig) {
		this.llmConfig = llmConfig;
	}

	public static instance(): OpenAICompletion {
		// TODO Support for multiple providers
		const llmConfig = SettingService.instance().getCodeCompletionConfig();
		if (!LlmProvider.instance_) {
			LlmProvider.instance_ = new LlmProvider(llmConfig);
		}

		return LlmProvider.instance_.create();
	}

	private create() {
		return new OpenAICompletion(this.llmConfig);
	}
}