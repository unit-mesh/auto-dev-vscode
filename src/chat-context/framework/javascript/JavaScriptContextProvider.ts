import { injectable } from "inversify";
import { ChatContextItem, ChatContextProvider, ChatCreationContext } from "../../ChatContextProvider";
import { JsDependenciesSnapshot, PackageJsonDependencyEntry } from "./JsDependenciesSnapshot";
import vscode from "vscode";
import path from "path";
import { TestStack } from "../jvm/TestStack";
import { getExtensionContext } from "../../../context";

@injectable()
export class JavaScriptContextProvider implements ChatContextProvider {
	static name = "JavaScriptContextProvider";

	isApplicable(context: ChatCreationContext): boolean {
		return context.language === "javascript" || context.language === "typescript" || context.language === "javascriptreact" || context.language === "typescriptreact";
	}

	async collect(context: ChatCreationContext): Promise<ChatContextItem[]> {
		let results = [];
		let snapshot = await this.create(getExtensionContext());
		let typeScriptLanguageContext = this.getTypeScriptLanguageContext(snapshot);
		let mostPopularPackagesContext = this.getMostPopularPackagesContext(snapshot);

		let techStack = this.prepareStack(snapshot);

		if (typeScriptLanguageContext) {
			results.push(typeScriptLanguageContext);
		}

		if (mostPopularPackagesContext) {
			results.push(mostPopularPackagesContext);
		}

		console.log(`Tech stack: ${techStack}`);
		if (techStack.coreFrameworksList().length > 0) {
			let element = {
				clazz: JavaScriptContextProvider.name,
				text: `The project uses the following JavaScript component frameworks: ${techStack.coreFrameworksList()}`
			};
			results.push(element);
		}

		if (techStack.testFrameworksList().length > 0) {
			let testChatContext = {
				clazz: JavaScriptContextProvider.name,
				text: `The project uses ${techStack.testFrameworksList()} to test.`
			};

			results.push(testChatContext);
		}

		return results;
	}

	prepareStack(snapshot: JsDependenciesSnapshot): TestStack {
		let devDependencies = new Map<string, string>();
		let dependencies = new Map<string, string>();
		let frameworks = new Map<string, boolean>();
		let testFrameworks = new Map<string, boolean>();

		// for (const [name, entry] of snapshot.packages) {
		// 	let dependencyType = entry.dependencyType;
		// 	if (dependencyType === PackageJsonDependency.dependencies || dependencyType === PackageJsonDependency.devDependencies) {
		// 		if (!name.startsWith("@types/")) {
		// 			devDependencies.set(name, entry.versionRange);
		// 		}
		//
		// 		for (const framework of JsWebFrameworks.values()) {
		// 			if (name.startsWith(framework.packageName) || name === framework.packageName) {
		// 				frameworks.set(framework.packageName, true);
		// 			}
		// 		}
		//
		// 		for (const framework of JsTestFrameworks.values() {
		// 			if (name.startsWith(framework.packageName) || name === framework.packageName) {
		// 				testFrameworks.set(framework.packageName, true);
		// 			}
		// 		}
		// 	}
		// }

		return new TestStack(frameworks, testFrameworks, dependencies, devDependencies);
	}

	getTypeScriptLanguageContext(snapshot: JsDependenciesSnapshot): ChatContextItem | undefined {
		const packageJson = snapshot.packages.get('typescript');
		if (!packageJson) {
			return undefined;
		}

		const version = packageJson.version;
		return {
			clazz: JavaScriptContextProvider.name,
			text: `The project uses TypeScript language${version ? `, version: ${version}` : ''}`
		};
	}

	/**
	 * Retrieves the most popular packages used in a given JavaScript dependencies snapshot.
	 *
	 * @param snapshot the JavaScript dependencies snapshot to analyze
	 * @return a ChatContextItem object representing the context of the most popular packages used in the project,
	 *         or null if no popular packages are found
	 */
	getMostPopularPackagesContext(snapshot: JsDependenciesSnapshot): ChatContextItem | undefined {
		const dependencies = snapshot.mostPopularFrameworks();
		if (dependencies.length === 0) {
			return undefined;
		}

		return {
			clazz: JavaScriptContextProvider.name,
			text: `The project uses the following JavaScript packages: ${dependencies.join(', ')}`
		};
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