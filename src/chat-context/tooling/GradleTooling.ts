import vscode from "vscode";
import * as util from "util";
import { ExtensionApi as GradleApi, RunTaskOpts, Output } from "vscode-gradle";

import { DependencyEntry, PackageDependencies } from "./_base/Dependence";
import { Tooling } from "./_base/Tooling";
import { PackageManger } from "./_base/PackageManger";
import { VSCodeAction } from "../../editor/action/VSCodeAction";

export class GradleTooling implements Tooling {
	moduleTarget = "build.gradle";

	gradleDepRegex: RegExp = /^([^:]+):([^:]+):(.+)$/;

	async findDeps(): Promise<PackageDependencies[]> {
		let extension = vscode.extensions.getExtension("vscjava.vscode-gradle");
		return await extension?.activate().then(async () => {
			const action = new VSCodeAction();
			const gradleApi = extension!.exports as GradleApi;
			const results: DependencyEntry[] = [];

			// https://docs.gradle.org/current/userguide/viewing_debugging_dependencies.html
			const runTaskOpts: RunTaskOpts = {
				projectFolder: action.getWorkspaceDirectories()[0],
				taskName: "dependencies",
				// --configuration compileClasspath
				args: ["--configuration", "compileClasspath"],
				showOutputColors: false,
				onOutput: (output: Output): void => {
					const message = new util.TextDecoder("utf-8").decode(output.getOutputBytes_asU8());

					let match = this.gradleDepRegex.exec(message);
					if (match !== null) {
						const [, group, artifact, version] = match;

						results.push({
							name: `${group}:${artifact}`,
							group,
							artifact,
							version
						});
					}
				},
			};

			await gradleApi.runTask(runTaskOpts);

			return [{
				name: this.getToolingName(),
				version: this.getToolingVersion(),
				path: "",
				dependencies: results,
				packageManager: PackageManger.GRADLE
			}];
		}) ?? [];
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
