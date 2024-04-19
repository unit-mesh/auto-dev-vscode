export interface Executor {
	execute(): Promise<void>;
}