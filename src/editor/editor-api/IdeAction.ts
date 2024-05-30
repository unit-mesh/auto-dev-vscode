import { GitAction } from "../../git/GitAction";

export interface IdeAction {
  git: GitAction;
  getTerminalContents(): Promise<string>;
  runCommand(command: string): Promise<void>;
  readFile(filepath: string): Promise<string>;
  getBranch(dir: string): Promise<string>;
  getStats(directory: string): Promise<{ [path: string]: number }>;
  getRepoName(dir: string): Promise<string | undefined>;
  getWorkspaceDirectories(): string[];
}
