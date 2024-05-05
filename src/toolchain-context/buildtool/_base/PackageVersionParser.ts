import { PackageDependencies } from "./Dependence";

export interface PackageVersionParser {
	lookupSource(content: string): PackageDependencies[];
}
