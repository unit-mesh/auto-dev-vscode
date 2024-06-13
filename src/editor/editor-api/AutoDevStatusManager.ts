import { StatusBarAlignment, type StatusBarItem, window } from 'vscode';

export enum AutoDevStatus {
	WAITING,
	Ready,
	InProgress,
	Error,
	Done,
}

export class AutoDevStatusManager {
	private statusBarItem: StatusBarItem;

	constructor() {
		const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);

		statusBarItem.command = 'autodev.showSystemAction';
		statusBarItem.text = '$(autodev-pair)';
		statusBarItem.tooltip = 'AutoDev';
		statusBarItem.show();

		this.statusBarItem = statusBarItem;
	}

	setIsLoading(tooltip?: string) {
		this.statusBarItem.text = '$(loading~spin)';
		this.statusBarItem.tooltip = tooltip || 'Loading...';
	}

	reset() {
		this.statusBarItem.text = '$(autodev-pair)';
		this.statusBarItem.tooltip = 'AutoDev';
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
		if (this.statusBarItem) {
			switch (status) {
				case AutoDevStatus.WAITING:
					this.statusBarItem.text = '$(autodev-icon)';
					break;
				case AutoDevStatus.Ready:
					this.statusBarItem.text = '$(autodev-icon)';
					break;
				case AutoDevStatus.InProgress:
					this.statusBarItem.text = '$(loading~spin)';
					break;
				case AutoDevStatus.Error:
					this.statusBarItem.text = '$(autodev-error)';
					break;
				case AutoDevStatus.Done:
					this.statusBarItem.text = '$(autodev-icon)';
					break;
			}
		}
	}
}
