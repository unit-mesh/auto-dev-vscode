import vscode from "vscode";
import { JsApplicationFrameworks, MOST_POPULAR_PACKAGES } from "./JavaScriptFrameworks";

export interface PackageJsonDependencyEntry {
	// Define the structure of PackageJsonDependencyEntry
	// This may vary based on your requirements
	name: string;
	version: string;
	dependencyType: PackageJsonDependency;
}

export enum PackageJsonDependency {
	dependencies = "dependencies",
	devDependencies = "devDependencies",
	peerDependencies = "peerDependencies",
	optionalDependencies = "optionalDependencies",
	bundledDependencies = "bundledDependencies",
}

/**
 * Represents a snapshot of JavaScript dependencies in a VSCode project.
 *
 * This class provides information about the JavaScript dependencies in the project, including the package.json files,
 * whether the package.json files have been resolved, the tsconfig.json files, and the packages defined in the package.json files.
 */
export class JsDependenciesSnapshot {
	packageJsonFiles: vscode.Uri[];
	resolvedPackageJson: boolean;
	tsConfigs: vscode.Uri[];
	packages: Map<string, PackageJsonDependencyEntry>;
	applicationFrameworks: string[] = Object.values(JsApplicationFrameworks);

	constructor(
		packageJsonFiles: vscode.Uri[],
		resolvedPackageJson: boolean,
		tsConfigs: vscode.Uri[],
		packages: Map<string, PackageJsonDependencyEntry>
	) {
		this.packageJsonFiles = packageJsonFiles;
		this.resolvedPackageJson = resolvedPackageJson;
		this.tsConfigs = tsConfigs;
		this.packages = packages;
	}

	mostPopularFrameworks(): string[] {
		const dependencies: string[] = [];
		for (const [name, entry] of this.packages) {
			if (MOST_POPULAR_PACKAGES.has(name) && !name.startsWith('@type')) {
				const version = entry.version;
				const dependency = version ? `${name}: ${version}` : name;
				dependencies.push(dependency);
			}
		}

		// this.applicationFrameworks is an array of strings
		for (const framework of this.applicationFrameworks) {
			if (dependencies.includes(framework)) {
				dependencies.push(framework);
			}
		}

		return dependencies;
	}

	language(): string {
		let language = 'JavaScript';
		let languageVersion = 'ES5';

		const packageJson = this.packages.get('typescript');
		if (packageJson) {
			const tsVersion = packageJson.version;
			if (tsVersion) {
				language = 'TypeScript';
				languageVersion = tsVersion;
			}
		}

		return `${language}: ${languageVersion}`;
	}
}
