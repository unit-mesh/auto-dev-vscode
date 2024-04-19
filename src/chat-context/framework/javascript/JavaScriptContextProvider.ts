import { injectable } from "inversify";

import { ChatContextItem, ChatContextProvider, ChatCreationContext } from "../../ChatContextProvider";
import { JsDependenciesSnapshot, PackageJsonDependency } from "./JsDependenciesSnapshot";
import { TechStack } from "../jvm/TechStack";
import { getExtensionContext } from "../../../context";
import { JsTestFrameworks, JsWebFrameworks } from "./JavaScriptFrameworks";
import { NpmBuildToolProvider } from "../../tooling/NpmBuildToolProvider";

@injectable()
export class JavaScriptContextProvider implements ChatContextProvider {
	async isApplicable(context: ChatCreationContext): Promise<boolean> {
		return context.language === "javascript" || context.language === "typescript" || context.language === "javascriptreact" || context.language === "typescriptreact";
	}

	async collect(context: ChatCreationContext): Promise<ChatContextItem[]> {
		let results = [];
		let snapshot = await new NpmBuildToolProvider().create(getExtensionContext());
		let typeScriptLanguageContext = this.getTypeScriptLanguageContext(snapshot);
		let mostPopularPackagesContext = this.getMostPopularPackagesContext(snapshot);

		let techStack = this.prepareStack(snapshot);

		if (typeScriptLanguageContext) {
			results.push(typeScriptLanguageContext);
		}

		if (mostPopularPackagesContext) {
			results.push(mostPopularPackagesContext);
		}

		console.log(`Tech stack: ${JSON.stringify(techStack)}`);
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

	prepareStack(snapshot: JsDependenciesSnapshot): TechStack {
		let devDependencies = new Map<string, string>();
		let dependencies = new Map<string, string>();
		let frameworks = new Map<string, boolean>();
		let testFrameworks = new Map<string, boolean>();

		for (const [name, entry] of snapshot.packages) {
			let dependencyType = entry.dependencyType;
			if (dependencyType === PackageJsonDependency.dependencies || dependencyType === PackageJsonDependency.devDependencies) {
				if (!name.startsWith("@types/")) {
					devDependencies.set(name, entry.version);
				}

				const webFramework = this.enumToMap(JsWebFrameworks);
				for (const [key, value] of webFramework) {
					if (name.startsWith(value) || name === value) {
						frameworks.set(key, true);
					}
				}

				const testFramework = this.enumToMap(JsTestFrameworks);
				for (const [key, value] of testFramework) {
					if (name.startsWith(value) || name === value) {
						testFrameworks.set(key, true);
					}
				}
			}
		}

		return new TechStack(frameworks, testFrameworks, dependencies, devDependencies);
	}

	enumToMap(enumObj: any): Map<string, string> {
		const enumMap = new Map<string, string>();
		for (const key in enumObj) {
			if (typeof enumObj[key] === 'string') {
				enumMap.set(key, enumObj[key]);
			}
		}
		return enumMap;
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
}