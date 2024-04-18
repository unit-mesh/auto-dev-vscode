import vscode, { Uri } from "vscode";
import { getExtensionUri } from "../context";
import { LlmConfig } from "./LlmConfig";

export class SettingService {
	private static instance_: SettingService;
	private projectUri: Uri | undefined;

	private constructor() {
		this.projectUri = getExtensionUri()
	}

	public static instance(): SettingService {
		if (!SettingService.instance_) {
			SettingService.instance_ = new SettingService();
		}

		return SettingService.instance_;
	}

	teamPromptsBaseDir(): string {
		const settings = vscode.workspace.getConfiguration('team-prompts', this.projectUri);
		return settings.get('prompts') || '';
	}

	llmConfig(): LlmConfig {
		const settings = vscode.workspace.getConfiguration('autodev.openaiCompatibleConfig', this.projectUri);
		return {
			apiBase: settings.get('server') || '',
			apiKey: settings.get('apiKey') || '',
			model: settings.get('model') || ''
		};
	}
}

