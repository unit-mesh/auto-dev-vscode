export interface IdeAction {
  getTerminalContents(): Promise<string>;
  runCommand(command: string): Promise<void>;
  readFile(filepath: string): Promise<string>;
  getBranch(dir: string): Promise<string>;
  getStats(directory: string): Promise<{ [path: string]: number }>;
  getRepoName(dir: string): Promise<string | undefined>;
}
