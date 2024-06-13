import { randomUUID } from 'node:crypto';

import { CancellationTokenSource, ExtensionContext, Uri, WebviewView, WebviewViewProvider, window } from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';
import type { IChatMessage } from 'base/common/language-models/languageModels';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { logger } from 'base/common/log/log';
import { showErrorMessage } from 'base/common/messages/messages';
import { getNonce } from 'base/common/webview/webview';
import { AbstractWebviewViewProvider } from 'base/common/webview/webviewView';

import { openSettings } from '../../../../commands/commands';
import {
	ApplyToCurrentFile,
	ContinueEvent,
	type FromWebviewMessage,
	type IChatMessageParam,
	IChatModelResource,
	type ShowErrorMessage,
} from './continueMessages';

export class ContinueViewProvider extends AbstractWebviewViewProvider implements WebviewViewProvider {
	constructor(
		private context: ExtensionContext,
		private configService: ConfigurationService,
		private lm: LanguageModelsService,
	) {
		super(context);

		// TODO disposable
		configService.onDidChange(event => {
			if (event.affectsConfiguration('autodev.chat.models')) {
				this.postMessage({
					messageId: randomUUID(),
					messageType: 'configUpdate',
				});
			}
		});
	}

	newSession(prompt?: string) {
		if (prompt) {
			this.send('newSessionWithPrompt', { prompt });
		} else {
			this.send('newSession');
		}
	}

	input(input: string) {
		this.send('userInput', { input });
	}

	async send(type: string, data?: unknown): Promise<boolean> {
		return this.postMessage({
			messageId: randomUUID(),
			messageType: type,
			data: data,
		});
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

		webview.onDidReceiveMessage((payload: FromWebviewMessage) => {
			if (!(payload && payload.messageType && payload.messageId)) {
				logger.error('(continue): Invalid webview protocol msg: ', payload);
				logger.show();
				return;
			}

			switch (payload.messageType) {
				case 'onLoad':
					this.handleViewLoad(new ContinueEvent(webview, payload));
					break;

				case 'config/getBrowserSerialized':
					this.handleBrowserSerialized(new ContinueEvent(webview, payload));
					break;

				case 'getOpenFiles':
					this.handleGetOpenFiles(new ContinueEvent(webview, payload));
					break;

				case 'openConfigJson':
					openSettings();
					break;

				case 'llm/streamChat':
					this.handleChatMessage(new ContinueEvent(webview, payload));
					break;

				case 'errorPopup':
					showErrorMessage((payload as ShowErrorMessage).data.message);
					break;

				case 'applyToCurrentFile':
					this.handleApplyToCurrentFile(payload);
					break;

				default:
					logger.debug('(continue): Unknown webview protocol msg: ', payload);
			}
		});
	}

	private handleApplyToCurrentFile(payload: ApplyToCurrentFile) {
		const text = payload.data.text;

		const editor = window.activeTextEditor;
		if (!editor) {
			return;
		}

		const selection = editor.selection;
		if (text) {
			editor.edit(builder => builder.replace(selection, text));
		}
	}

	private handleViewLoad(event: ContinueEvent<'onLoad'>) {
		event.reply({
			windowId: '1',
			serverUrl: '',
			workspacePaths: [],
			vscMachineId: '1111',
			vscMediaUrl: '',
		});
	}

	private handleGetOpenFiles(event: ContinueEvent<'getOpenFiles'>) {
		event.reply([]);
	}

	private async listModels(): Promise<IChatModelResource[]> {
		const resources = this.configService.getConfig<IChatModelResource[]>('chat.models');
		if (!resources) {
			return [];
		}

		return resources.map(res => {
			return {
				title: res.title,
				provider: res.provider,
				model: res.model,
			};
		});
	}

	private async handleBrowserSerialized(event: ContinueEvent<'config/getBrowserSerialized'>) {
		event.reply({
			models: await this.listModels(),
			allowAnonymousTelemetry: false,
		});
	}

	private async handleChatMessage(event: ContinueEvent<'llm/streamChat'>) {
		try {
			const cancellation = new CancellationTokenSource();

			const models = await this.listModels();

			const title = event.data.title;
			const provider = this.configService.get('chat.provider');
			const metadata = models.find(m => m.title === title);

			const completionOptions = event.data.completionOptions;

			await this.lm.chat(
				mapToChatMessages(event.data.messages),
				{
					...completionOptions,
					provider: metadata?.provider || provider,
					model: metadata?.model,
				},
				{
					report(fragment) {
						event.reply({ content: fragment.part });
					},
				},
				cancellation.token,
			);
		} catch (err) {
			logger.error('(continue): Chat stream response error: ', err);
			logger.show(false);
			event.reply({
				content: `Error: ${(err as Error).message}`,
			});
		} finally {
			event.reply({
				done: true,
			});
		}
	}
}

function mapToChatMessages(messages: IChatMessageParam[]): IChatMessage[] {
	return messages.map(msg => {
		const param: IChatMessage = {
			role: msg.role,
			content: '',
		};

		msg.content.forEach(part => {
			if (part.type === 'text') {
				param.content = part.text;
			}
		});

		return param;
	});
}
