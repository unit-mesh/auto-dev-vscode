export interface Action {
	execute(): Promise<void>;
}