import { BuildToolProvider } from "./BuildToolProvider";
import { PackageDependencies } from "./Dependence";
import vscode from "vscode";
import { CreateToolchainContext } from "../../ToolchainContextProvider";
import path from "path";
import fs from "fs";

export abstract class BaseBuildToolProvider implements BuildToolProvider {
	moduleTarget: string[] = [];

	abstract getToolingName(): string;

	abstract getToolingVersion(): Promise<string>;

	abstract getDependencies(): Promise<PackageDependencies>;

	abstract getTasks(): Promise<string[]>;

	async isApplicable(context?: CreateToolchainContext): Promise<boolean> {
		const workspaces = vscode.workspace.workspaceFolders || [];
		const workspace = workspaces[0];

		let hasTarget = false;
		for (const target of this.moduleTarget) {
			const targetPath = path.join(workspace.uri.fsPath, target);
			if (fs.existsSync(targetPath)) {
				hasTarget = true;
			}
		}

		return hasTarget;
	}

	async getTargetContent(target: string): Promise<string> {
		let workspaces = vscode.workspace.workspaceFolders || [];
		const workspace = workspaces[0];

		const targetPath = path.join(workspace!!.uri.fsPath, target);
		return fs.readFileSync(targetPath, "utf-8");
	}
}