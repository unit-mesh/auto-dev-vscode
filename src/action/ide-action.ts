export interface IdeAction {
  getTerminalContents(): Promise<string>;
}
