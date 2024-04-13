import { extensions } from "vscode";
import { PackageDependencies } from "./_base/Dependence";
import { Tooling } from "./_base/Tooling";
import { PackageManger } from "./_base/PackageManger";

export class GradleTooling implements Tooling {
	moduleTarget = "build.gradle";

	// TODO: the old code uses the `findDeps` method to find dependencies, but it's not implemented here
	findDeps(): PackageDependencies[] {
		let java = extensions.getExtension("redhat.java");
		if (!java?.activate()) {
			return [];
		}

		return [];
	}

	getDependencies(): PackageDependencies {
		return {
			name: this.getToolingName(),
			version: this.getToolingVersion(),
			path: "",
			dependencies: this.findDeps(),
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

	getTasks(): string[] {
		return [];
	}
}
