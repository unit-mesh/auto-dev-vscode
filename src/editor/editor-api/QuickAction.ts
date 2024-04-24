import { CustomActionPrompt } from "../../prompt-manage/team-prompts/CustomActionPrompt";
import { window } from "vscode";
import { AutoDevExtension } from "../../AutoDevExtension";

export class QuickActionService {
	// singleton
	private static instance_: QuickActionService;
	private quickPick = window.createQuickPick();
	private items: { [key: string]: CustomActionPrompt } = {};

	private constructor() {
	}

	public static instance(): QuickActionService {
		if (!QuickActionService.instance_) {
			QuickActionService.instance_ = new QuickActionService();
		}

		return QuickActionService.instance_;
	}

	registerCustomPrompt(name: string, prompt: CustomActionPrompt) {
		this.items[name] = prompt;
	}

	async showQuickAction(extension: AutoDevExtension) {
		this.quickPick.items = Object.keys(this.items).map(label => ({ label }));
		this.quickPick.onDidChangeSelection(async selection => {
			if (selection[0]) {
				const item = this.items[selection[0].label];
				await item.execute(extension);
			}
		});
		this.quickPick.onDidHide(() => this.quickPick.dispose());
		this.quickPick.show();
	}
}

