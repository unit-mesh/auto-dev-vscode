import { injectable } from "inversify";

import { PackageDependencies } from "./_base/Dependence";
import { GoModParser, goVersionParser } from "./go/GoVersionParser";
import { BaseBuildToolProvider } from "./_base/BaseBuildToolProvider";

@injectable()
export class GoBuildToolProvider extends BaseBuildToolProvider {
	moduleTarget: string[] = ["go.mod"];

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

	async getDependencies(): Promise<PackageDependencies> {
		const source = await this.getTargetContent(this.moduleTarget[0]);
		return new GoModParser().retrieveDependencyData(source)[0] || { dependencies: [] };
	}

	getTasks(): Promise<string[]> {
		throw new Error("Method not implemented.");
	}

}