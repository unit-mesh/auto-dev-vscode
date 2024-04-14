export enum AutoDevStatus {
	WAITING,
	Ready,
	InProgress,
	Error,
	Done
}

export class StatusNotification {
		private static _instance: StatusNotification;

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
}