import { DependencyInspector } from "../_base/DependencyInspector";
import { DependencyEntry, PackageDependencies } from "../_base/Dependence";
import { PackageManger } from "../_base/PackageManger";

export class GoModDependencyInspector implements DependencyInspector {
	private goDependenceRegex: RegExp = new RegExp("([a-zA-Z0-9\\.\-\/]+)\\s+v([a-zA-Z0-9\\.\-\/]+)");
	private goVersionRegex: RegExp = new RegExp("go\\s+([0-9\\.]+)");
	private moduleTag: string = "go.mod";

	parseDependency(content: string): PackageDependencies[] {
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

		return [
			{
				name: moduleName,
				version: goVersion,
				path: this.moduleTag,
				packageManager: PackageManger.GoMod,
				dependencies: deps
			}
		] as PackageDependencies[];
	}
}