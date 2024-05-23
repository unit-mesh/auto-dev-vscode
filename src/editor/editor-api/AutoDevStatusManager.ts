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

	/**
	 * The `setStatusBar` method is a public method that sets the status of the status bar in the application.
	 * It takes a single parameter, `status`, which is of type `AutoDevStatus`.
	 *
	 * `AutoDevStatus` is an enumeration that represents the different states that the application can be in.
	 * It includes the following states: `WAITING`, `Ready`, `InProgress`, `Error`, and `Done`.
	 *
	 * The method first checks if the `statusBar` exists. If it does, it sets the text of the `statusBar`
	 * based on the `status` parameter passed to the method. The text is set using a switch statement that
	 * checks the value of `status` and sets the text of the `statusBar` accordingly.
	 *
	 * If the `status` is `WAITING`, `Ready`, or `Done`, the text of the `statusBar` is set to "$(autodev-icon)".
	 * If the `status` is `InProgress`, the text of the `statusBar` is set to "$(loading~spin)".
	 * If the `status` is `Error`, the text of the `statusBar` is set to "$(autodev-error)".
	 *
	 * @param status - The status of the application, represented as a value from the `AutoDevStatus` enumeration.
	 * @public
	 */
	public setStatus(status: AutoDevStatus) {
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

	initStatusBar() {
		const autoDevStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		autoDevStatusBar.command = "autodev.systemAction";
		autoDevStatusBar.text = "$(autodev-pair)";
		autoDevStatusBar.show();
		this.statusBar = autoDevStatusBar;
	}
}