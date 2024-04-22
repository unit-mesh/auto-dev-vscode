import { PackageDependencies } from "./Dependence";

/**
 * The `Tooling` interface defines a set of methods for buildtool-related operations.
 *
 * @interface BuildToolProvider
 * @property {string} getToolingName - Returns the name of the buildtool.
 * @property {string} getToolingVersion - Returns the version of the buildtool.
 * @property {PackageDependencies} getDependencies - Returns an object representing the buildtool's dependencies.
 */
export interface BuildToolProvider {
	moduleTarget: string[];

	/**
	 * Returns the name of the buildtool.
	 */
	getToolingName(): string;

	/**
	 * Returns the version of the buildtool.
	 */
	getToolingVersion(): Promise<string>

	/**
	 * Returns an object representing the buildtool's dependencies.
	 */
	getDependencies(): Promise<PackageDependencies>;

	/**
	 * Searches for dependencies in the buildtool.
	 */
	getTasks(): Promise<string[]>;
}