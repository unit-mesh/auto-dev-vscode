import vscode, { Uri } from "vscode";
import { getExtensionUri } from "../context";
import { LlmConfig } from "./LlmConfig";

export class SettingService {
	private static instance_: SettingService;
	private projectUri: Uri | undefined;

	private constructor() {
		this.projectUri = getExtensionUri();
	}

	public static instance(): SettingService {
		if (!SettingService.instance_) {
			SettingService.instance_ = new SettingService();
		}

		return SettingService.instance_;
	}

	customPromptsDir(): string {
		const settings = vscode.workspace.getConfiguration('prompts', this.projectUri);
		return settings.get('prompts') || '';
	}

	llmConfig(): LlmConfig {
		const settings = vscode.workspace.getConfiguration('autodev.openaiCompatibleConfig', this.projectUri);
		return {
			apiType: settings.get('apiType') || '',
			apiBase: settings.get('apiBase') || '',
			apiKey: settings.get('apiKey') || '',
			model: settings.get('model') || ''
		};
	}
}

