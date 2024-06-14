import { ToolchainContextItem } from '../../toolchain-context/ToolchainContextProvider';

export interface CustomActionExecutePrompt {
	displayPrompt: string;
	requestPrompt: string;
	contextItems: ToolchainContextItem[];
}
