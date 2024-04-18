import vscode, { Uri } from "vscode";
import { getExtensionUri } from "../context";

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
}