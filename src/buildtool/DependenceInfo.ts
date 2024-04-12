export enum DEP_SCOPE {
	NORMAL,
	RUNTIME,
	TEST,
	OPTIONAL,
	DEV,
	BUILD
}

// Function to convert string to DEP_SCOPE enum
export function depScopeFromString(str: string): DEP_SCOPE {
	switch (str.toLowerCase()) {
		case "test":
			return DEP_SCOPE.TEST;
		// Add cases for other scope types as needed
		default:
			return DEP_SCOPE.NORMAL;
	}
}

// Interface for dependency source
export interface DepSource {
	type: string;
	url: string;
	branch: string;
	ref: string;
}

// Interface for dependency metadata
export interface DepMetadata {
	packagingType: string;
	propertyName: string;
}

/**
 * DependencyEntry is an interface that represents a single dependency in a project's dependency graph.
 * It contains information about the dependency, such as its name, groupId, artifactId, version, scope, source, and metadata.
 * The aliasName is an optional field that can be used to specify an alternative name for the dependency in the configuration file.
 */
export interface DependencyEntry {
	// Full name groupId:artifactId
	name: string;
	group?: string;
	artifact?: string;
	version?: string;
	// Scope of the dependency
	scope?: DEP_SCOPE;
	// Source of the dependency
	source?: DepSource;
	// Metadata of the dependency
	metadata?: DepMetadata;
	// Alias name in libs.version.toml
	aliasName?: string;
}

// Interface for package dependencies
/**
 * PackageDependencies is an interface that represents a package and its dependencies.
 * It is used to describe the structurer of a package, including its name, version, package manager,
 * dependencies, file path, and child dependencies.
 *
 * @interface PackageDependencies
 * @property {string} name - The name of the package.
 * @property {string} version - The version of the package.
 * @property {string} packageManager - The package manager used to manage the package.
 * @property {DependencyEntry[]} dependencies - An array of DependencyEntry objects that represent the package's dependencies.
 * @property {string} path - The file path to the package.
 * @property {PackageDependencies[]} childrens - An optional array of PackageDependencies objects that represent the package's child dependencies.
 */
export interface PackageDependencies {
	// Self name
	name: string;
	// Self-version for some cases
	version: string;
	// Like `maven`, `gradle`
	packageManager: PackageManger;
	// Requirements in maven
	dependencies: DependencyEntry[];
	// File path
	path: string;
	// Child dependencies
	childrens?: PackageDependencies[];
}

enum PackageManger {
	MAVEN,
	GRADLE,
	NPM,
	YARN
}