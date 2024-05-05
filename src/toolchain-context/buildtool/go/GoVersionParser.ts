import { DependencyEntry, PackageDependencies } from "../_base/Dependence";
import { PackageManger } from "../_base/PackageManger";
import { PackageVersionParser } from "../_base/PackageVersionParser";

/**
 * Parse the version info from `go version` command.
 * @param stdout  e.g. `go version go1.21.1 darwin/amd64`
 * @returns the version of the Go tooling, e.g. `1.21.1`
 */
export function goVersionParser(stdout: string) {
	const versionRegex = /go version go(\d+\.\d+\.\d+)/;
	const match = versionRegex.exec(stdout);
	if (match) {
		return match[1];
	}
	return "";
}

export class GoModParser implements PackageVersionParser {
	private goDependenceRegex: RegExp = new RegExp("([a-zA-Z0-9\\.\-\/]+)\\s+v([a-zA-Z0-9\\.\-\/]+)");
	private goVersionRegex: RegExp = new RegExp("go\\s+([0-9\\.]+)");
	private moduleTag: string = "go.mod";

	lookupSource(content: string): PackageDependencies[] {
		let moduleName: string = "";
		let goVersion: string = "";
		let deps: DependencyEntry[] = [];

		content.split('\n').forEach((line) => {
			line = line.trim();
			if (line.startsWith("module")) {
				moduleName = line.split(" ")[1];
			}

			if (line.startsWith("go")) {
				goVersion = (line.match(this.goVersionRegex) || [])[1] || "";
			}

			const matchResult = line.match(this.goDependenceRegex);
			if (matchResult !== null) {
				const [, name, version] = matchResult;

				const split = name.split("/");

				const artifact = split.slice(-1)[0];
				const group = split.slice(0, -1).join("/");

				deps.push({
					name,
					group,
					artifact,
					version
				});
			}
		});

		return [{
			name: moduleName,
			version: goVersion,
			path: this.moduleTag,
			packageManager: PackageManger.GoMod,
			dependencies: deps
		}] as PackageDependencies[];
	}
}