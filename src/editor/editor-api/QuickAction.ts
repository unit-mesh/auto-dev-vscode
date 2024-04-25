import { window } from "vscode";

import { CustomActionPrompt } from "../../prompt-manage/custom-action/CustomActionPrompt";
import { AutoDevExtension } from "../../AutoDevExtension";
import { Service } from "../../service/Service";
import { CustomActionContextBuilder } from "../../prompt-manage/custom-action/CustomActionContextBuilder";
import { CustomActionExecutor } from "../../prompt-manage/custom-action/CustomActionExecutor";

export class QuickActionService implements Service {
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
		const currentDocument = window.activeTextEditor?.document;
		if (!currentDocument) {
			return;
		}

		let context = await CustomActionContextBuilder.fromDocument(currentDocument);
		await CustomActionExecutor.execute(context, prompt);
	}
}

