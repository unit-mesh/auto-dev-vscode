import { Tooling } from "./_base/Tooling";
import { PackageDependencies } from "./_base/Dependence";
import { PackageManger } from "./_base/PackageManger";
import path from "path";

export class NpmTooling implements Tooling {
	moduleTarget = "package.json";

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

	/**
	 * According to the given file path, find the tooling directory. For example, our project structure is:
	 *
	 * ```
	 * ├── package.json
	 * └── src
	 *     ├── components
	 *     │   ├── archive
	 *     │   │   └── EditableDiv.tsx
	 *     └── util
	 * ```
	 *
	 * if the given file path is `src/components/archive/EditableDiv.tsx`, the method should return the path to the tooling directory.
	 */
	lookupRelativeTooling(filepath: String): string {
		const segments = filepath.split(path.sep);

		// Find the index of the "src" directory
		const srcIndex = segments.indexOf('src');
		if (srcIndex === -1) {
			return "";
		}

		const projectPath = segments.slice(0, srcIndex + 1).join(path.sep);
		const toolingPath = `${projectPath}${path.sep}package.json`;
		return toolingPath;
	}

	getTasks(): string[] {
		return [];
	}
}
