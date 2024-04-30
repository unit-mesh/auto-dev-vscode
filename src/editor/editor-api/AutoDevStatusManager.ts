import vscode from "vscode";

export enum AutoDevStatus {
	WAITING,
	Ready,
	InProgress,
	Error,
	Done
}

export class AutoDevStatusManager {
	private static _instance: AutoDevStatusManager;
	private statusBar: vscode.StatusBarItem | undefined;

	private constructor() {
	}

	public static get instance() {
		if (!AutoDevStatusManager._instance) {
			AutoDevStatusManager._instance = new AutoDevStatusManager();
		}

		return AutoDevStatusManager._instance;
	}

	public setStatusBar(status: AutoDevStatus) {
		if (this.statusBar) {
			switch (status) {
				case AutoDevStatus.WAITING:
					this.statusBar!!.text = "$(autodev-icon)";
					break;
				case AutoDevStatus.Ready:
					this.statusBar!!.text = "$(autodev-icon)";
					break;
				case AutoDevStatus.InProgress:
					this.statusBar!!.text = "$(loading~spin)";
					break;
				case AutoDevStatus.Error:
					this.statusBar!!.text = "$(autodev-error)";
					break;
				case AutoDevStatus.Done:
					this.statusBar!!.text = "$(autodev-icon)";
					break;
			}
		}
	}

	create() {
		const autoDevStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		autoDevStatusBar.command = "autodev.systemAction";
		autoDevStatusBar.text = "$(autodev-pair)";
		autoDevStatusBar.show();
		this.statusBar = autoDevStatusBar;
	}
}