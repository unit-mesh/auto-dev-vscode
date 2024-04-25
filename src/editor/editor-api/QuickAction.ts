import { window } from "vscode";

import { CustomActionPrompt } from "../../prompt-manage/custom-action/CustomActionPrompt";
import { AutoDevExtension } from "../../AutoDevExtension";
import { Service } from "../../service/Service";
import { CustomActionContextBuilder } from "../../prompt-manage/custom-action/CustomActionContextBuilder";
import { CustomActionExecutor } from "../../prompt-manage/custom-action/CustomActionExecutor";
import { TeamPromptsBuilder } from "../../prompt-manage/team-prompts/TeamPromptsBuilder";

export class QuickActionService implements Service {
	private static instance_: QuickActionService;
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

	async show(extension: AutoDevExtension) {
		this.items = {};
		let quickPick = window.createQuickPick();
		let customPrompts = TeamPromptsBuilder.instance().teamPrompts();
		customPrompts.forEach(prompt => {
			this.registerCustomPrompt(prompt.actionName, prompt.actionPrompt);
		});

		quickPick.items = Object.keys(this.items).map(label => ({ label }));
		quickPick.onDidChangeSelection(async selection => {
			if (selection[0]) {
				quickPick.hide();
				const item = this.items[selection[0].label];
				await this.execute(extension, item);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
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

