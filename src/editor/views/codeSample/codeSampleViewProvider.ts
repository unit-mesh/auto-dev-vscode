/* eslint-disable curly */
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { load } from 'js-yaml';
import _ from 'lodash';
import {
	CancellationTokenSource,
	commands,
	ExtensionContext,
	Uri,
	WebviewView,
	WebviewViewProvider,
	window,
} from 'vscode';

import { CMD_CODEASPACE_ANALYSIS, CMD_CODEASPACE_KEYWORDS_ANALYSIS } from 'base/common/configuration/configuration';
import { ConfigurationService } from 'base/common/configuration/configurationService';
import { defer } from 'base/common/defer';
import { ChatMessageRole, type IChatMessage } from 'base/common/language-models/languageModels';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { logger } from 'base/common/log/log';
import { showErrorMessage } from 'base/common/messages/messages';
import { getNonce } from 'base/common/webview/webview';
import { AbstractWebviewViewProvider } from 'base/common/webview/webviewView';

export class CodeSampleViewProvider extends AbstractWebviewViewProvider implements WebviewViewProvider {
	private historySaveDir = path.join(os.homedir(), '.autodev/sessions');
	private _readyDefer = defer<void>();

	constructor(
		private context: ExtensionContext,
		private configService: ConfigurationService,
		private lm: LanguageModelsService,
	) {
		super(context);

		logger.debug('CodeSampleViewProvider init');
		// // TODO disposable
		// configService.onDidChange(event => {
		// 	if (event.affectsConfiguration('autodev.chat.models')) {
		// 		this.postMessage({
		// 			messageId: randomUUID(),
		// 			messageType: 'configUpdate',
		// 		});
		// 	}
		// });
	}

	ready() {
		return this._readyDefer.promise;
	}



	async provideWebviewView(webviewView: WebviewView): Promise<void> {
		const webview = webviewView.webview;
		const extensionUri = this.context.extensionUri;

		const assetsDir = Uri.joinPath(extensionUri, 'gui-sidebar/dist/assets');

		webview.asWebviewUri(Uri.joinPath(extensionUri, 'gui-sidebar'));

		webview.options = {
			enableScripts: true,
			localResourceRoots: [assetsDir],
		};

		const nonce = getNonce();

		const styleUrl = webview.asWebviewUri(Uri.joinPath(assetsDir, 'index.css'));
		const scriptUrl = webview.asWebviewUri(Uri.joinPath(assetsDir, 'index.js'));

		webview.html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>const vscode = acquireVsCodeApi();</script>
        <link href="${styleUrl}" rel="stylesheet">

        <title>Continue</title>
      </head>
      <body>
        <div id="root"></div>

        <script>localStorage.setItem("ide", "vscode")</script>
        <script>window.windowId = ""</script>
        <script>window.vscMachineId = ""</script>
        <script>window.vscMediaUrl = ""</script>
        <script>window.ide = "vscode"</script>
        <script>window.workspacePaths = [];</script>
        <script>window.isFullScreen = </script>
        <script type="module" nonce="${nonce}" src="${scriptUrl}"></script>
      </body>
    </html>`;


	}




}
