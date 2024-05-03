import { BuildToolProvider } from "./BuildToolProvider";
import { PackageDependencies } from "./Dependence";
import vscode from "vscode";

export abstract class BaseBuildToolProvider implements BuildToolProvider {
	moduleTarget: string[] = [];

	abstract getToolingName(): string;

	abstract getToolingVersion(): Promise<string>;

	abstract getDependencies(): Promise<PackageDependencies>;

	abstract getTasks(): Promise<string[]>;

	async isApplicable(): Promise<boolean> {
		const workspaces = vscode.workspace.workspaceFolders || [];
		const workspace = workspaces[0];

		let hasTarget = false;
		for (const target of this.moduleTarget) {
			const targetPath = vscode.Uri.joinPath(workspace.uri, target);
			try {
				const targetFileType = await vscode.workspace.fs.stat(targetPath);
				if (targetFileType.type === vscode.FileType.File) {
					hasTarget = true;
					break;
				}
			} catch (error) {
				// do nothing
			}
		}

		return hasTarget;
	}

	async getTargetContent(target: string): Promise<string> {
		const workspaces = vscode.workspace.workspaceFolders || [];
		const workspace = workspaces[0];
		const targetPath = vscode.Uri.joinPath(workspace.uri, target);
		const targetContent = await vscode.workspace.fs.readFile(targetPath);
		return Buffer.from(targetContent).toString();
	}
}