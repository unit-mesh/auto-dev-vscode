import { TreeSitterFile } from "../../code-context/ast/TreeSitterFile";

export class JavaRelevantLookup {
	tsfile: TreeSitterFile;

	constructor(tsfile: TreeSitterFile) {
		this.tsfile = tsfile;
	}

	/**
	 * Filter out the relevant class from the given types and imports
	 * @param types
	 * @param imports
	 */
	calculateRelevantClass(types: string[], imports: string[]) {
		const relevantImports = JavaRelevantLookup.filterByTypes(imports, types);
		console.log(relevantImports);
	}

	private static filterByTypes(imports: string[], types: string[]) {
		// remove import and ;
		const canonicalNames = imports.map(imp => {
			const impArr = imp.split(' ');
			return impArr[impArr.length - 1].replace(';', '');
		});

		// filter imports ending with the class name which is in types
		return canonicalNames.filter(imp => {
			const impArr = imp.split('.');
			return types.includes(impArr[impArr.length - 1]);
		});
	}

	/**
	 * Given a package name, if similar to current tsfile package, try to lookup in the codebase.
	 */
	calculateByPackageName(packageName: string) {

	}
}