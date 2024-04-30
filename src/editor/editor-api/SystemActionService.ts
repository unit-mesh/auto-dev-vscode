import { window } from "vscode";

import { Service } from "../../service/Service";
import { AutoDevExtension } from "../../AutoDevExtension";

export enum SystemAction {
	Indexing = "Indexing",
}

export type SystemActionHandler = (extension: AutoDevExtension) => void;

export class SystemActionService implements Service {
	private static instance_: SystemActionService;

	private constructor() {
	}

	public static instance(): SystemActionService {
		if (!SystemActionService.instance_) {
			SystemActionService.instance_ = new SystemActionService();
		}

		return SystemActionService.instance_;
	}

	async show(extension: AutoDevExtension) {
		let pick = window.createQuickPick();

		const items: { [key: string]: SystemActionHandler } = {
			[SystemAction.Indexing]: this.indexAction.bind(this),
		};

		pick.items = Object.keys(items).map(label => ({ label }));
		pick.onDidChangeSelection(async selection => {
			if (selection[0]) {
				const item = items[selection[0].label];
				await item(extension);
				pick.hide();
			}
		});

		pick.onDidHide(() => pick.dispose());
		pick.show();
	}

	async indexAction(extension: AutoDevExtension) {
		console.log("Indexing action");
	}
}