import { ActionType } from "../../../prompt-manage/ActionType";

export interface ActionExecutor {
	type: ActionType;

	execute(): Promise<void>;
}