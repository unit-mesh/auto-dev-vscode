import { CustomActionPrompt } from "../custom-action/CustomActionPrompt";

export interface TeamPromptAction {
	actionName: string;
	actionPrompt: CustomActionPrompt;
}