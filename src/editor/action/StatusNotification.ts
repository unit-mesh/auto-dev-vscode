import vscode from "vscode";

export enum AutoDevStatus {
	WAITING,
	Ready,
	InProgress,
	Error,
	Done
}

export class StatusNotification {
	private static _instance: StatusNotification;
	private statusBar: vscode.StatusBarItem | undefined;

	private constructor() {
	}

	public static get instance() {
		if (!StatusNotification._instance) {
			StatusNotification._instance = new StatusNotification();
		}
		return StatusNotification._instance;
	}

	private listeners: Map<AutoDevStatus, Function[]> = new Map();

	public subscribe(event: AutoDevStatus, callback: Function) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)?.push(callback);
	}

	public publish(event: AutoDevStatus, ...args: any[]) {
		if (!this.listeners.has(event)) {
			return;
		}
		this.listeners.get(event)?.forEach(callback => {
			callback(...args);
		});
	}

	public unsubscribe(event: AutoDevStatus, callback: Function) {
		if (!this.listeners.has(event)) {
			return;
		}
		let callbacks = this.listeners.get(event);
		if (callbacks) {
			let index = callbacks.indexOf(callback);
			if (index > -1) {
				callbacks.splice(index, 1);
			}
		}
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

		this.publish(status);
	}

	create() {
		const autoDevStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		autoDevStatusBar.command = "autodev.autodevGUIView";
		autoDevStatusBar.text = "$(autodev-icon)";
		autoDevStatusBar.show();
		this.statusBar = autoDevStatusBar;
	}
}