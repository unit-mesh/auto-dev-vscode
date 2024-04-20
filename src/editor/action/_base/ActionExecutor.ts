export interface ActionExecutor {
	execute(): Promise<void>;
}