import { ActionType } from "../ActionType";

export interface ActionExecutor {
	type: ActionType;

	execute(): Promise<void>;
}