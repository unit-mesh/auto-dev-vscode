import { PackageDependencies } from "./Dependence";

export interface PackageVersionParser {
	retrieveDependencyData(content: string): PackageDependencies[];
}
