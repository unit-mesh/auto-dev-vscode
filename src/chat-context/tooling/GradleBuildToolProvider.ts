import vscode, { Extension } from "vscode";
import * as util from "util";
import { ExtensionApi as GradleApi, RunTaskOpts, Output } from "vscode-gradle";
import { injectable } from "inversify";

import { DependencyEntry, PackageDependencies } from "./_base/Dependence";
import { BuildToolProvider } from "./_base/BuildToolProvider";
import { PackageManger } from "./_base/PackageManger";
import { VSCodeAction } from "../../editor/editor-api/VSCodeAction";
import { GradleVersionInfo, parseGradleVersionInfo } from "./gradle/GradleVersionInfo";
import { channel } from "../../channel";

@injectable()
export class GradleBuildToolProvider implements BuildToolProvider {
	moduleTarget = ["build.gradle", "build.gradle.kts"];

	private gradleDepRegex: RegExp = /^([^:]+):([^:]+):(.+)$/;
	private gradleInfo: GradleVersionInfo | undefined;

	// singleton
	private static instance_: GradleBuildToolProvider;
	private deps: PackageDependencies | undefined;

	static instance(): GradleBuildToolProvider {
		if (!GradleBuildToolProvider.instance_) {
			GradleBuildToolProvider.instance_ = new GradleBuildToolProvider();
		}

		return GradleBuildToolProvider.instance_;
	}

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

	async startWatch() {
		if (await this.isApplicable()) {
			return;
		}

		this.deps = await this.getDependencies();
		this.gradleInfo = await this.getGradleVersion();
	}

	async getDependencies(): Promise<PackageDependencies> {
		if (this.deps) {
			return this.deps;
		}

		return await this.buildDeps();
	}

	getToolingName(): string {
		return "gradle";
	}

	async getToolingVersion(): Promise<string> {
		return this.gradleInfo?.gradleVersion ?? "unknown";
	}

	private async buildDeps(): Promise<PackageDependencies> {
		let extension = GradleBuildToolProvider.getExtension();
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

			return {
				name: this.getToolingName(),
				version: await this.getToolingVersion(),
				path: "",
				dependencies: results,
				packageManager: PackageManger.GRADLE
			};
		}) ?? await Promise.reject("Gradle not found");
	}

	static getExtension(): Extension<any> | undefined {
		return vscode.extensions.getExtension("vscjava.vscode-gradle");
	}

	async getGradleVersion(): Promise<GradleVersionInfo> {
		let extension = GradleBuildToolProvider.getExtension();
		return await extension?.activate().then(async () => {
			const gradleApi = extension!.exports as GradleApi;
			const action = new VSCodeAction();
			const workspace = action.getWorkspaceDirectories()[0];
			let outputString = "";

			const runTaskOpts: RunTaskOpts = {
				projectFolder: workspace,
				taskName: "tasks",
				args: ["-version"],
				showOutputColors: false,
				onOutput: (output: Output): void => {
					const message = new util.TextDecoder("utf-8").decode(output.getOutputBytes_asU8());
					outputString += message;
				},
			};

			await gradleApi.runTask(runTaskOpts);

			channel.append("Gradle Info:\n" + outputString);
			return parseGradleVersionInfo(outputString);
		}) ?? await Promise.reject("Gradle not found");
	}

	async getTasks(): Promise<string[]> {
		return [];
	}
}
