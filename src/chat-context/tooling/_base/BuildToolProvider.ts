import { PackageDependencies } from "./Dependence";

/**
 * The `Tooling` interface defines a set of methods for tooling-related operations.
 *
 * @interface BuildToolProvider
 * @property {string} getToolingName - Returns the name of the tooling.
 * @property {string} getToolingVersion - Returns the version of the tooling.
 * @property {PackageDependencies} getDependencies - Returns an object representing the tooling's dependencies.
 */
export interface BuildToolProvider {
	moduleTarget: string[];

	/**
	 * Returns the name of the tooling.
	 */
	getToolingName(): string;

	/**
	 * Returns the version of the tooling.
	 */
	getToolingVersion(): Promise<string>

	/**
	 * Returns an object representing the tooling's dependencies.
	 */
	getDependencies(): Promise<PackageDependencies>;

	/**
	 * Searches for dependencies in the tooling.
	 */
	getTasks(): Promise<string[]>;
}