import vscode from 'vscode';

import { ActionCreatorContext } from './ActionCreatorContext';

export interface ActionCreator {
	isApplicable(creatorContext: ActionCreatorContext): boolean;

	buildActions(context: ActionCreatorContext): Promise<vscode.CodeAction[]>;
}
