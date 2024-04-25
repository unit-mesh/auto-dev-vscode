import { CustomActionPrompt } from "../../prompt-manage/custom-action/CustomActionPrompt";
import { window } from "vscode";
import { AutoDevExtension } from "../../AutoDevExtension";

export class QuickActionService {
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
				await this.execute(extension, item);
			}
		});
		this.quickPick.onDidHide(() => this.quickPick.dispose());
		this.quickPick.show();
	}


	async execute(extension: AutoDevExtension, prompt: CustomActionPrompt) {
		await window.showInformationMessage("Executing custom-action action: " + prompt.name);
	}
}

