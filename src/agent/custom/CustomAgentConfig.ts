import { InteractionType } from "../../prompt-manage/InteractionType";
import { CustomAgentResponseAction } from "./CustomAgentResponseAction";

export class CustomFlowTransition {
	/**
	 * will be JsonPath
	 */
	source: string;
	/**
	 * will be JsonPath too
	 */
	target: string;

	constructor(source: string, target: string) {
		this.source = source;
		this.target = target;
	}
}

export class ConnectorConfig {
	/**
	 * will be Json Config
	 */
	requestFormat: string;
	/**
	 * will be JsonPath
	 */
	responseFormat: string;

	constructor(requestFormat: string = "", responseFormat: string = "") {
		this.requestFormat = requestFormat;
		this.responseFormat = responseFormat;
	}
}


export enum CustomAgentState {
	START = 'START',
	HANDLING = 'HANDLING',
	FINISHED = 'FINISHED'
}

export class CustomAgentAuth {
	type: AuthType;
	token: string;

	constructor(type: AuthType = AuthType.Bearer, token: string = '') {
		this.type = type;
		this.token = token;
	}
}

export enum AuthType {
	Bearer = 'Bearer'
}


export class CustomAgentConfig {
	name: string;
	description: string;
	url: string;
	icon: string;
	connector?: ConnectorConfig | null;
	responseAction: CustomAgentResponseAction;
	transition: CustomFlowTransition[];
	interactive: InteractionType;
	auth?: CustomAgentAuth | null;
	state: CustomAgentState;

	constructor(
		name: string,
		description: string = '',
		url: string = '',
		icon: string = '',
		connector: ConnectorConfig | null = null,
		responseAction: CustomAgentResponseAction = CustomAgentResponseAction.Direct,
		transition: CustomFlowTransition[] = [],
		interactive: InteractionType = InteractionType.ChatPanel,
		auth: CustomAgentAuth | null = null
	) {
		this.name = name;
		this.description = description;
		this.url = url;
		this.icon = icon;
		this.connector = connector;
		this.responseAction = responseAction;
		this.transition = transition;
		this.interactive = interactive;
		this.auth = auth;
		this.state = CustomAgentState.START;
	}
}