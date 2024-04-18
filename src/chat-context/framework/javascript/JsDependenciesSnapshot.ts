import vscode from "vscode";
import { MOST_POPULAR_PACKAGES } from "./JavaScriptFrameworks";
import path from "path";

export interface PackageJsonDependencyEntry {
	// Define the structure of PackageJsonDependencyEntry
	// This may vary based on your requirements
	name: string;
	version: string;
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

	async create(context: vscode.ExtensionContext): Promise<JsDependenciesSnapshot> {
		let packageJsonFiles: vscode.Uri[] = [];
		let resolvedPackageJson = false;

		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
			if (workspaceFolder) {
				const packageJsonPath = vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, 'package.json'));
				let fileStat = await vscode.workspace.fs.stat(packageJsonPath);
				if (fileStat.type === vscode.FileType.File) {
					packageJsonFiles = [packageJsonPath];
					resolvedPackageJson = true;
				}
			}

			if (packageJsonFiles.length === 0) {
				packageJsonFiles = await vscode.workspace.findFiles('**/package.json');
			}

			const tsConfigs = await this.findTsConfigs(context);
			const packages = await this.enumerateAllPackages(packageJsonFiles);
			let jsDependenciesSnapshot = new JsDependenciesSnapshot(packageJsonFiles, resolvedPackageJson, tsConfigs, packages);
			return jsDependenciesSnapshot;
		}

		return new JsDependenciesSnapshot([], false, [], new Map());
	}

	async enumerateAllPackages(packageJsonFiles: vscode.Uri[]): Promise<Map<string, PackageJsonDependencyEntry>> {
		const allPackages = new Map<string, PackageJsonDependencyEntry>();
		for (const file of packageJsonFiles) {
			const packageJson = await vscode.workspace.fs.readFile(file).then(data => JSON.parse(data.toString()));
			for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
				allPackages.set(name, <PackageJsonDependencyEntry>{ name, version });
			}
			for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
				allPackages.set(name, <PackageJsonDependencyEntry>{ name, version });
			}
		}
		return allPackages;
	}

	async findTsConfigs(context: vscode.ExtensionContext): Promise<vscode.Uri[]> {
		const tsConfigFiles: vscode.Uri[] = [];
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders) {
			for (const folder of workspaceFolders) {
				const tsConfigPath = vscode.Uri.file(path.join(folder.uri.fsPath, 'tsconfig.json'));
				let fileStat = await vscode.workspace.fs.stat(tsConfigPath);
				if (fileStat.type === vscode.FileType.File) {
					tsConfigFiles.push(tsConfigPath);
				}
			}
		}
		return tsConfigFiles;
	}
}