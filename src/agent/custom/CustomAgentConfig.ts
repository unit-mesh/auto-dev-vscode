import { InteractionType } from "../../prompt-manage/InteractionType";
import { CustomAgentResponseAction } from "./CustomAgentResponseAction";
import { CustomFlowTransition } from "./CustomFlowTransition";
import { ConnectorConfig } from "./ConnectorConfig";
import { CustomAgentAuth } from "./CustomAgentAuth";
import { CustomAgentState } from "./CustomAgentState";

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