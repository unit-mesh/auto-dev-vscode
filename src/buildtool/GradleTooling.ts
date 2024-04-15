import vscode from "vscode";
import * as util from "util";
import { ExtensionApi as GradleApi, RunTaskOpts, Output } from "vscode-gradle";

import { PackageDependencies } from "./_base/Dependence";
import { Tooling } from "./_base/Tooling";
import { PackageManger } from "./_base/PackageManger";
import { VSCodeAction } from "../action/VSCodeAction";

export class GradleTooling implements Tooling {
	moduleTarget = "build.gradle";

	async findDeps(): Promise<PackageDependencies[]> {
		let extension = vscode.extensions.getExtension("vscjava.vscode-extension");
		if (!extension?.activate()) {
			return [];
		}

		const action = new VSCodeAction();
		const gradleApi = extension!.exports as GradleApi;
		const runTaskOpts: RunTaskOpts = {
			projectFolder: action.getWorkspaceDirectories()[0],
			taskName: "help",
			showOutputColors: false,
			onOutput: (output: Output): void => {
				const message = new util.TextDecoder("utf-8").decode(
					output.getOutputBytes_asU8()
				);
				console.log(output.getOutputType(), message);
			},
		};
		await gradleApi.runTask(runTaskOpts);

		return [];
	}

	async getDependencies(): Promise<PackageDependencies> {
		return {
			name: this.getToolingName(),
			version: this.getToolingVersion(),
			path: "",
			dependencies: await this.findDeps(),
			packageManager: PackageManger.GRADLE
		};
	}

	getToolingName(): string {
		return "gradle";
	}

	getToolingVersion(): string {
		return "";
	}

	lookupRelativeTooling(filepath: String): string {
		return "";
	}

	async getTasks(): Promise<string[]> {
		return [];
	}
}
