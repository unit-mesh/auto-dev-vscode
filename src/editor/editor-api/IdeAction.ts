export interface IdeAction {
  getTerminalContents(): Promise<string>;
  runCommand(command: string): Promise<void>;
}
