import { PackageDependencies } from "./Dependence";

/**
 * The `Tooling` interface defines a set of methods for tooling-related operations.
 *
 * @interface Tooling
 * @property {string} getToolingName - Returns the name of the tooling.
 * @property {string} getToolingVersion - Returns the version of the tooling.
 * @property {PackageDependencies} getDependencies - Returns an object representing the tooling's dependencies.
 */
export interface Tooling {
	getToolingName(): string;
	getToolingVersion(): string;

	getDependencies(): PackageDependencies;
}