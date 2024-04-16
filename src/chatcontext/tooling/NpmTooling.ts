import { Tooling } from "./_base/Tooling";
import { DEP_SCOPE, DependencyEntry, PackageDependencies } from "./_base/Dependence";
import { PackageManger } from "./_base/PackageManger";
import path from "path";

export class NpmTooling implements Tooling {
	moduleTarget = "package.json";

	depTypeMap: { [key: string]: DEP_SCOPE } = {
		'dependencies': DEP_SCOPE.NORMAL,
		'optionalDependencies': DEP_SCOPE.OPTIONAL,
		'devDependencies': DEP_SCOPE.DEV
	};

	async getDependencies(): Promise<PackageDependencies> {
		return this.lookupSource(this.moduleTarget);
	}

	lookupSource(filepath: string): PackageDependencies {
		let packageJson = JSON.parse(filepath);
		let name = packageJson.name;
		const version: string = packageJson.version;

		const deps: DependencyEntry[] = ["dependencies", "optionalDependencies", "devDependencies"].flatMap(field =>
			this.createDepByType(field, filepath)
		);

		return {
			name,
			version,
			packageManager: PackageManger.NPM,
			dependencies: deps,
			path: filepath
		};
	}

	private createDepByType(field: string, content: string): DependencyEntry[] {
		const listOf: DependencyEntry[] = [];
		const optionalDep: { [key: string]: string } | undefined = JSON.parse(content)[field];
		if (optionalDep !== undefined) {
			listOf.push(...this.createDependencies(optionalDep, this.depTypeMap[field]));
		}

		return listOf;
	}

	private createDependencies(depMap: { [key: string]: string }, scope: DEP_SCOPE): DependencyEntry[] {
		return Object.entries(depMap).map(([key, value]) => ({
			name: key,
			group: "",
			artifact: key,
			version: value,
			scope: scope
		}));
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

	async getTasks(): Promise<string[]> {
		return [];
	}
}
