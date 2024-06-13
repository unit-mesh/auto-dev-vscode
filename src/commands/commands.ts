import { commands } from 'vscode';

import { CMD_OPEN_SETTINGS, CMD_NEW_CHAT_SESSION } from 'base/common/configuration/configuration';

export function openSettings() {
	return commands.executeCommand(CMD_OPEN_SETTINGS);
}

export function reloadWebview() {
	commands.executeCommand('workbench.action.webview.reloadWebviewAction');
}

export function newChatSession(prompt?: string) {
	commands.executeCommand(CMD_NEW_CHAT_SESSION, prompt);
}
