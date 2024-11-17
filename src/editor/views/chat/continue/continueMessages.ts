import type { ChatMessageRole } from 'base/common/language-models/languageModels';
import { IDataStorage } from 'base/common/workspace/WorkspaceService';

interface BaseToWebviewMessage<Type = string, Data = void> {
	readonly messageId: string;
	readonly messageType: Type;
	readonly data: Data;
}

type WebviewMessageBuilder<Type, From = void, To = void> = {
	from: BaseToWebviewMessage<Type, From>;
	to: BaseToWebviewMessage<Type, To>;
};

export interface ContextItemId {
	providerTitle: string;
	itemId: string;
}

export interface ContextItemWithId {
	content: string;
	name: string;
	description: string;
	id: ContextItemId;
	editing?: boolean;
	editable?: boolean;
}

export interface RangeInFile {
	filepath: string;
	range: Range;
}

export type IChatModelResource = {
	title: string;
	provider: string;
	model: string;
};

export type IChatMessageContentPartText = {
	/**
	 * The text content.
	 */
	text: string;

	/**
	 * The type of the content part.
	 */
	type: 'text';
};

export type IChatMessageContentPart = IChatMessageContentPartText;

export type IChatMessageParam = {
	role: ChatMessageRole;
	content: IChatMessageContentPart[];
};

export type IHistoryItem = {
	message: IChatMessageParam;
	editorState: unknown;
	contextItems: [];
};

export interface SessionInfo {
	sessionId: string;
	title: string;
	dateCreated: string;
	workspaceDirectory: string;
}

export interface PersistedSessionInfo extends SessionInfo {
	history: IHistoryItem[];
}

// TODO use contine protocol
export type ContinueMessageMap = {
	// Initialization
	onLoad: WebviewMessageBuilder<
		'onLoad',
		void,
		{
			windowId: string;
			serverUrl: string;
			workspacePaths: string[];
			vscMachineId: string;
			vscMediaUrl: string;
		}
	>;
	configUpdate: WebviewMessageBuilder<'configUpdate'>;
	errorPopup: WebviewMessageBuilder<
		'errorPopup',
		{
			message: string;
		}
	>;

	// Configuration
	'config/getBrowserSerialized': WebviewMessageBuilder<
		'config/getBrowserSerialized',
		void,
		{
			models: IChatModelResource[];
			allowAnonymousTelemetry: boolean;
		}
	>;
	openConfigJson: WebviewMessageBuilder<'openConfigJson'>;

	// Workspace
	getOpenFiles: WebviewMessageBuilder<'getOpenFiles', void, string[]>;

	// Chat
	newSession: WebviewMessageBuilder<'newSession'>;
	'llm/streamChat': WebviewMessageBuilder<
		'llm/streamChat',
		{
			title: string;
			completionOptions?: object;
			messages: IChatMessageParam[];
		},
		{
			content?: string;
			done?: boolean;
		}
	>;
	'history/list': WebviewMessageBuilder<'history/list', void, SessionInfo[]>;
	'history/load': WebviewMessageBuilder<
		'history/load',
		{
			id: string;
		},
		PersistedSessionInfo | void
	>;
	'history/delete': WebviewMessageBuilder<
		'history/delete',
		{
			id: string;
		}
	>;
	'history/save': WebviewMessageBuilder<'history/save', PersistedSessionInfo>;
	'command/run': WebviewMessageBuilder<
		'command/run',
		{
			input: string;
			history: IHistoryItem[];
			modelTitle: string;
			slashCommandName: string;
			contextItems: IChatMessageParam[];
			params: any;
			historyIndex: number;
			selectedCode: RangeInFile[];
		},
		{
			done?: boolean;
			content: string;
		}
	>;
	'WorkspaceService.AddDataStorage': WebviewMessageBuilder<
		'WorkspaceService.AddDataStorage',
		{key:string;originalItem:string},
		string
	>;
	'WorkspaceService.RemoveDataStorage': WebviewMessageBuilder<
	'WorkspaceService.RemoveDataStorage',
	{key:string;originalItem:string},
	string
>;
'WorkspaceService.ChangeDataStorage': WebviewMessageBuilder<
'WorkspaceService.ChangeDataStorage',
{key:string;originalItem:string;newItem:string},
string
>;
'WorkspaceService.GetDataStorage': WebviewMessageBuilder<
'WorkspaceService.GetDataStorage',
string,
string
>;
'WorkspaceService.Groups.AddGroup': WebviewMessageBuilder<
'WorkspaceService.Groups.AddGroup',
{data:string},
string
>;
'WorkspaceService.Groups.RemoveGroup': WebviewMessageBuilder<
'WorkspaceService.Groups.RemoveGroup',
{group:string},
string
>;
'WorkspaceService.Groups.GetGroups': WebviewMessageBuilder<
'WorkspaceService.Groups.GetGroups',
{groups:string},
string
>;
	// Actions
	applyToCurrentFile: WebviewMessageBuilder<
		'applyToCurrentFile',
		{
			text: string;
		}
	>;
};

export type ApplyToCurrentFile = ContinueMessageMap['applyToCurrentFile']['from'];

export type ShowErrorMessage = ContinueMessageMap['errorPopup']['from'];

export type FromWebviewMessage = ContinueMessageMap[keyof ContinueMessageMap]['from'];

export type ToWebviewMessage = ContinueMessageMap[keyof ContinueMessageMap]['to'];

export type MessageChannel = {
	postMessage(data: unknown): void;
};

export class ContinueEvent<
	Type extends keyof ContinueMessageMap,
	FromMessage extends ContinueMessageMap[Type]['from'] = ContinueMessageMap[Type]['from'],
	ToMessage extends ContinueMessageMap[Type]['to'] = ContinueMessageMap[Type]['to'],
> {
	readonly id: string;
	readonly type: FromMessage['messageType'];
	readonly data: FromMessage['data'];

	constructor(
		private channel: MessageChannel,
		public payload: FromMessage,
	) {
		this.id = payload.messageId;
		this.type = payload.messageType;
		this.data = payload.data;
	}

	reply(data: ToMessage['data']) {
		this.channel.postMessage({
			messageId: this.id,
			messageType: this.type,
			data: data,
		});
	}

	empty() {
		this.channel.postMessage({
			messageId: this.id,
			messageType: this.type,
		});
	}
}

export interface Message<T = any> {
	messageType: string;
	messageId: string;
	data: T;
}
