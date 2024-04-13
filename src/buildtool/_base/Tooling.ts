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
	moduleTarget: string;

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
	lookupRelativeTooling(filepath: String): string;

	/**
	 * Returns the name of the tooling.
	 */
	getToolingName(): string;

	/**
	 * Returns the version of the tooling.
	 */
	getToolingVersion(): string;

	/**
	 * Returns an object representing the tooling's dependencies.
	 */
	getDependencies(): PackageDependencies;

	/**
	 * Searches for dependencies in the tooling.
	 */
	getTasks(): string[];
}