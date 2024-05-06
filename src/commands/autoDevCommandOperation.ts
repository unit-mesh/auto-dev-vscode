import { AutoDevCommand } from "./autoDevCommand";

export type AutoDevCommandOperation = {
	[command in AutoDevCommand]: (...args: any[]) => any;
};