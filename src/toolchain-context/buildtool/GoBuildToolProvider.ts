import { injectable } from "inversify";
import { BuildToolProvider } from "./_base/BuildToolProvider";
import { PackageDependencies } from "./_base/Dependence";
import vscode from "vscode";
import { goVersionParser } from "./GoVersionParser";

@injectable()
export class GoBuildToolProvider implements BuildToolProvider {
	moduleTarget: string[] = ["go.mod"];

	async isApplicable(): Promise<boolean> {
		const workspaces = vscode.workspace.workspaceFolders;
		if (!workspaces) {
			return false;
		}
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

	getToolingName(): string {
		return "Go Mod";
	}

	/**
	 * Execute `go version`, then parse results, and return the version of the Go tooling.
	 *
	 * the return example: `go version go1.16.3 darwin/amd64`
	 *
	 */
	getToolingVersion(): Promise<string> {
		let versionInfo: Promise<string> = new Promise((resolve, reject) => {
			const exec = require("child_process").exec;
			exec("go version", (error: any, stdout: any, stderr: any) => {
				if (error) {
					reject(error);
				}
				resolve(stdout);
			});
		});

		// Parse the version info use regex
		return versionInfo.then((stdout) => {
			return goVersionParser(stdout);
		});
	}

	getDependencies(): Promise<PackageDependencies> {
		throw new Error("Method not implemented.");
	}

	getTasks(): Promise<string[]> {
		throw new Error("Method not implemented.");
	}

}