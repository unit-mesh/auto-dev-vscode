import path from 'path';
import vscode from 'vscode';

import {
	JsDependenciesSnapshot,
	PackageJsonDependency,
	PackageJsonDependencyEntry,
} from '../framework/javascript/JsDependenciesSnapshot';
import { BaseBuildToolProvider } from './_base/BaseBuildToolProvider';
import { DEP_SCOPE, DependencyEntry, PackageDependencies } from './_base/Dependence';
import { PackageManger } from './_base/PackageManger';

export class NpmBuildToolProvider extends BaseBuildToolProvider {
	constructor(private context: vscode.ExtensionContext) {
		super();
	}

	moduleTarget = ['package.json'];

	depTypeMap: { [key: string]: DEP_SCOPE } = {
		dependencies: DEP_SCOPE.NORMAL,
		optionalDependencies: DEP_SCOPE.OPTIONAL,
		devDependencies: DEP_SCOPE.DEV,
	};

	async getDependencies(): Promise<PackageDependencies> {
		let deps = await this.create(this.context);
		let packageDependencies: PackageDependencies = {
			name: 'package.json',
			dependencies: [],
			version: '',
			path: 'package.json',
			packageManager: PackageManger.NPM,
		};

		deps.packages.forEach((value, key) => {
			packageDependencies.dependencies.push(<DependencyEntry>{
				name: value.name,
				version: value.version,
				scope: this.depTypeMap[value.dependencyType],
			});
		});

		return packageDependencies;
	}

	getToolingName(): string {
		return 'npm';
	}

	async getToolingVersion(): Promise<string> {
		return '';
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
			return new JsDependenciesSnapshot(packageJsonFiles, resolvedPackageJson, tsConfigs, packages);
		}

		return new JsDependenciesSnapshot([], false, [], new Map());
	}

	async enumerateAllPackages(packageJsonFiles: vscode.Uri[]): Promise<Map<string, PackageJsonDependencyEntry>> {
		const allPackages = new Map<string, PackageJsonDependencyEntry>();
		for (const file of packageJsonFiles) {
			const packageJson = await vscode.workspace.fs.readFile(file).then(data => JSON.parse(data.toString()));
			for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
				allPackages.set(name, <PackageJsonDependencyEntry>{
					name,
					version,
					dependencyType: PackageJsonDependency.dependencies,
				});
			}
			for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
				allPackages.set(name, <PackageJsonDependencyEntry>{
					name,
					version,
					dependencyType: PackageJsonDependency.devDependencies,
				});
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

	async getTasks(): Promise<string[]> {
		return [];
	}
}
