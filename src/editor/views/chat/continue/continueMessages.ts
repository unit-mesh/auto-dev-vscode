import type { ChatMessageRole } from 'base/common/language-models/languageModels';

interface BaseToWebviewMessage<Type = string, Data = void> {
	readonly messageId: string;
	readonly messageType: Type;
	readonly data: Data;
}

type WebviewMessageBuilder<Type, From = void, To = void> = {
	from: BaseToWebviewMessage<Type, From>;
	to: BaseToWebviewMessage<Type, To>;
};

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
	'history/save': WebviewMessageBuilder<
		'history/save',
		{
			sessionId: string;
			title: string;
			history: IHistoryItem[];
			workspaceDirectory: string;
		}
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
}
