import { Tooling } from "./_base/Tooling";
import { PackageDependencies } from "./_base/Dependence";
import { PackageManger } from "./_base/PackageManger";

export class NpmTooling implements Tooling {
	getDependencies(): PackageDependencies {
		return {
			name: this.getToolingName(),
			version: this.getToolingVersion(),
			path: "",
			dependencies: [],
			packageManager: PackageManger.MAVEN,
		};
	}

	getToolingName(): string {
		return "npm";
	}

	getToolingVersion(): string {
		return "";
	}

}