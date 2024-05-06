import { PackageDependencies } from "./Dependence";

export interface DependencyInspector {
	parseDependency(content: string): PackageDependencies[];
}
