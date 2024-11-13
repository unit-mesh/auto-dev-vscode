/* eslint-disable curly */
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { plainToClass, plainToInstance } from 'class-transformer';
import { load } from 'js-yaml';
import _ from 'lodash';
import { CodeSample } from 'src/action/addCodeSample/AddCodeSampleExecutor';
import { AutoDevExtension } from 'src/AutoDevExtension';
import { json } from 'stream/consumers';
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
import { WorkspaceService } from 'base/common/workspace/WorkspaceService';

import { openSettings } from '../../../../commands/commands';
import {
	ApplyToCurrentFile,
	ContinueEvent,
	type FromWebviewMessage,
	type IChatMessageParam,
	IChatModelResource,
	Message,
	PersistedSessionInfo,
	SessionInfo,
	type ShowErrorMessage,
} from './continueMessages';
import { data } from 'node_modules/cheerio/dist/commonjs/api/attributes';
import { FrameworkCodeFragment } from 'src/code-context/_base/LanguageModel/ClassElement/FrameworkCodeFragmentExtractorBase';

export class ContinueViewProvider extends AbstractWebviewViewProvider implements WebviewViewProvider {
	private historySaveDir = path.join(os.homedir(), '.autodev/sessions');
	private _readyDefer = defer<void>();
	constructor(
		private context: ExtensionContext,
		private configService: ConfigurationService,
		private lm: LanguageModelsService,
		private workSpace: WorkspaceService,
	) {
		super(context);
		logger.debug('ContinueViewProvider init');
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

	ready() {
		return this._readyDefer.promise;
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

	async request(type: string, data?: unknown): Promise<boolean> {
		const messageId = randomUUID();

		await this.ready();

		return new Promise((resolve, reject) => {
			const disposable = this._webview!.onDidReceiveMessage((msg: Message) => {
				if (msg.messageId === messageId) {
					logger.debug(`message received, messageID: ${messageId}`);
					resolve(msg.data);
					disposable?.dispose();
				}
			});
			this.postMessage({
				messageId: messageId,
				messageType: type,
				data: data,
			});
			logger.debug(`send success, messageType:${type},messageID:${messageId}`);
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
			let language = undefined;
			let editor = window.activeTextEditor;
			language = editor?.document.languageId;
			switch (payload.messageType) {
				case 'onLoad':
					logger.debug('sidebar webview onLoad ');
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

				case 'history/list':
					this.handleShowChatList(new ContinueEvent(webview, payload));
					break;

				case 'history/load':
					this.handleLoadChat(new ContinueEvent(webview, payload));
					break;

				case 'history/delete':
					this.handleDeleteChat(new ContinueEvent(webview, payload));
					break;

				case 'history/save':
					this.handleSaveChatHistory(new ContinueEvent(webview, payload));
					break;

				case 'command/run':
					this.handleSlashCommand(new ContinueEvent(webview, payload));
					break;

				case 'configUpdate':
					// ignore
					break;
				case 'WorkspaceService.AddDataStorage':
					if (!editor) break;
					if (language) {
						switch (payload.data.key) {
							case 'CodeSample':
								let dataRemoved= CodeSample.DeserializationFormJson(JSON.parse(payload.data.originalItem));
								this.workSpace.AddDataStorage(language, dataRemoved);
								break;
							case 'FrameworkCodeFragment':
								let dataRemoved1= FrameworkCodeFragment.DeserializationFormJson(JSON.parse(payload.data.originalItem));
								this.workSpace.AddDataStorage(language, dataRemoved1);
								break;
					}
				}
					break;
				case 'WorkspaceService.GetDataStorage':
					if (language) {
						let storages = this.workSpace.GetDataStorages(language, payload.data);
						let storagesJson = JSON.stringify(storages);
						let data = { key: payload.data, language: language, storages: storagesJson };
						this.send('WorkspaceService_GetDataStorage', data);
					}
					break;
				case 'WorkspaceService.RemoveDataStorage':
					if (language) {
						switch (payload.data.key) {
							case 'CodeSample':
								let dataRemoved= CodeSample.DeserializationFormJson(JSON.parse(payload.data.originalItem));
								this.workSpace.RemoveDataStorage(language, dataRemoved);
								break;
							case 'FrameworkCodeFragment':
								let dataRemoved1= FrameworkCodeFragment.DeserializationFormJson(JSON.parse(payload.data.originalItem));
								this.workSpace.RemoveDataStorage(language, dataRemoved1);
								break;
						}
					}
					break;
				case 'WorkspaceService.ChangeDataStorage':
					if (language) {
						switch (payload.data.key) {
							case 'FrameworkCodeFragment':
								let ollDataFormat =FrameworkCodeFragment.DeserializationFormJson(JSON.parse(payload.data.originalItem));
								let newDataFormat = FrameworkCodeFragment.DeserializationFormJson(JSON.parse(payload.data.newItem));
								this.workSpace.ChangeDataStorage(language, payload.data.key, ollDataFormat, newDataFormat);
								break;
							case 'CodeSample':
								let ollDataFormat1 =CodeSample.DeserializationFormJson(JSON.parse(payload.data.originalItem));
								let newDataFormat1 = 	CodeSample.DeserializationFormJson(JSON.parse(payload.data.newItem));
								this.workSpace.ChangeDataStorage(language, payload.data.key, ollDataFormat1, newDataFormat1);

								break;
						}
					}

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
		this._readyDefer.resolve();
	}

	private handleGetOpenFiles(event: ContinueEvent<'getOpenFiles'>) {
		event.reply([]);
	}

	private async handleSaveChatHistory(event: ContinueEvent<'history/save'>) {
		await saveAndUpdateChat(this.historySaveDir, event.data);
		event.empty();
	}

	private async handleShowChatList(event: ContinueEvent<'history/list'>) {
		event.reply(await getChats(this.historySaveDir));
	}

	private async handleLoadChat(event: ContinueEvent<'history/load'>) {
		event.reply(await loadChat(this.historySaveDir, event.data.id));
	}

	private async handleDeleteChat(event: ContinueEvent<'history/delete'>) {
		await deleteChat(this.historySaveDir, event.data.id);
		event.empty();
	}

	private async listModels(): Promise<IChatModelResource[]> {
		const resources = this.configService.getConfig<IChatModelResource[]>('chat.models');
		return resources ?? [];
	}

	readonly slashCommandsMap: Record<string, string> = {
		'codespace-code': CMD_CODEASPACE_ANALYSIS,
		'codespace-keywords': CMD_CODEASPACE_KEYWORDS_ANALYSIS,
	};

	private async handleSlashCommand(event: ContinueEvent<'command/run'>) {
		try {
			const slashCommandName = event.data.slashCommandName;
			const cmd = this.slashCommandsMap[slashCommandName];
			if (!cmd) {
				logger.warn('(webview): unknown slash command', slashCommandName);
				event.reply({
					done: true,
					content: '',
				});
				return;
			}

			const arg = event.data.input.replace(`/${slashCommandName}`, '').trim();

			const result = await commands.executeCommand<string>(cmd, arg);

			logger.debug('(webview): command/run', cmd, result);

			if (!result) {
				return;
			}

			const title = event.data.modelTitle;

			const models = await this.listModels();
			const metadata = models.find(m => m.title === title);

			// TODO with history messages
			await this.lm.chat(
				[
					{
						role: ChatMessageRole.User,
						content: result,
					},
				],
				{
					provider: metadata?.provider,
					model: metadata?.model,
				},
				{
					report(fragment) {
						event.reply({ content: fragment.part });
					},
				},
			);
		} catch (error) {
			logger.error('(webview): command run fail', error);
			showErrorMessage('Slash Command fail');
		} finally {
			event.reply({
				done: true,
				content: '',
			});
		}
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
			const resource = models.find(m => m.title === title);

			const completionOptions = event.data.completionOptions;

			await this.lm.chat(
				mapToChatMessages(event.data.messages),
				{
					...resource,
					...completionOptions,
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

async function loadChat(base: string, id: string): Promise<PersistedSessionInfo | void> {
	if (!existsSync(base)) return;

	try {
		const filePath = path.join(base, `${id}.json`);
		if (statSync(filePath).isFile()) {
			try {
				return JSON.parse(await fs.readFile(filePath, 'utf-8'));
			} catch {
				// ignore
				logger.debug(`(webview): session ${id} read error`);
			}
		}
	} catch (error) {
		logger.error('(webview): load chats error', error);
	}
}

async function deleteChat(base: string, id: string) {
	if (!existsSync(base)) return;

	try {
		const filePath = path.join(base, `${id}.json`);
		if (statSync(filePath).isFile()) {
			await fs.unlink(filePath);
		}
	} catch (error) {
		logger.error('(webview): load chats error', error);
	}
}

async function getChats(base: string): Promise<SessionInfo[]> {
	const sessions: SessionInfo[] = [];

	if (!existsSync(base)) return sessions;

	try {
		for (const file of await fs.readdir(base)) {
			const filePath = path.join(base, file);
			if (statSync(filePath).isFile()) {
				try {
					const item = JSON.parse(await fs.readFile(filePath, 'utf-8'));
					sessions.push(_.omit(item, 'history') as SessionInfo);
				} catch {
					// ignore
					logger.debug(`(webview): session ${file} read error`);
				}
			}
		}
	} catch (error) {
		logger.error('(webview): query chats error', error);
		showErrorMessage('Query Chats Error');
	}

	return sessions;
}

async function saveAndUpdateChat(base: string, data: ContinueEvent<'history/save'>['data']) {
	if (!existsSync(base)) {
		mkdirSync(base);
	}

	try {
		// TODO support workspaceDirectory
		const saveFilePath = path.join(base, `${data.sessionId}.json`);

		const item = Object.assign(
			{
				dateCreated: new Date().toISOString(),
			},
			data,
		);

		await fs.writeFile(saveFilePath, JSON.stringify(item), 'utf-8');

		logger.debug('(webview): history save success');
	} catch (error) {
		logger.error('(webview): history save error', error);
		showErrorMessage('Chat History Save Error');
	}
}
