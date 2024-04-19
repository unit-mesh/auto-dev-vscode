import vscode from "vscode";
import * as util from "util";
import { ExtensionApi as GradleApi, RunTaskOpts, Output } from "vscode-gradle";

import { DependencyEntry, PackageDependencies } from "./_base/Dependence";
import { Tooling } from "./_base/Tooling";
import { PackageManger } from "./_base/PackageManger";
import { VSCodeAction } from "../../editor/editor-api/VSCodeAction";

export class GradleTooling implements Tooling {
	moduleTarget = "build.gradle";
	gradleDepRegex: RegExp = /^([^:]+):([^:]+):(.+)$/;

	// singleton
	private static instance_: GradleTooling;
	private deps: PackageDependencies | undefined;

	private constructor() {
	}

	static instance(): GradleTooling {
		if (!GradleTooling.instance_) {
			GradleTooling.instance_ = new GradleTooling();
		}
		return GradleTooling.instance_;
	}

	async startWatch() {
		this.deps = await this.getDependencies();
	}

	async getDependencies(): Promise<PackageDependencies> {
		if (this.deps) {
			return this.deps;
		}

		return {
			name: this.getToolingName(),
			version: await this.getToolingVersion(),
			path: "",
			dependencies: await this.buildDeps(),
			packageManager: PackageManger.GRADLE
		};
	}

	getToolingName(): string {
		return "gradle";
	}

	async getToolingVersion(): Promise<string> {
		return "";
	}

	private async buildDeps(): Promise<PackageDependencies[]> {
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
				version: await this.getToolingVersion(),
				path: "",
				dependencies: results,
				packageManager: PackageManger.GRADLE
			}];
		}) ?? [];
	}

	lookupRelativeTooling(filepath: String): string {
		return "";
	}

	async getTasks(): Promise<string[]> {
		return [];
	}
}
