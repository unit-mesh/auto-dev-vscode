import { TextDocument } from 'vscode';
import { ActionType } from '../../prompt-manage/ActionType';

export interface ActionExecutor {
	type: ActionType;

	execute(document: TextDocument): Promise<void>;
}
