import { PackageDependencies } from "./Dependence";

/**
 * The `Tooling` interface defines a set of methods for tooling-related operations.
 *
 * @interface Tooling
 * @property {string} getToolingName - Returns the name of the tooling.
 * @property {string} getToolingVersion - Returns the version of the tooling.
 * @property {PackageDependencies} getDependencies - Returns an object representing the tooling's dependencies.
 */
export class Tooling {
	moduleTarget: string[] = [];

	/**
	 * Returns the name of the tooling.
	 */
	getToolingName(): string {
		return "";
	}

	/**
	 * Returns the version of the tooling.
	 */
	async getToolingVersion(): Promise<string> {
		return "";
	}

	/**
	 * Returns an object representing the tooling's dependencies.
	 */
	async getDependencies(): Promise<PackageDependencies> {
		return Promise.reject("Not implemented");
	}

	/**
	 * Searches for dependencies in the tooling.
	 */
	async getTasks(): Promise<string[]> {
		return [];
	}
}