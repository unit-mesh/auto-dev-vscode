import { TreeSitterFile } from "../../code-context/ast/TreeSitterFile";
import { JavaLangConfig } from "../../code-context/java/JavaLangConfig";

export class JavaRelevantLookup {
	tsfile: TreeSitterFile;

	constructor(tsfile: TreeSitterFile) {
		this.tsfile = tsfile;
	}

	/**
	 * Filter out the relevant class from the given imports and imports
	 * @param imports
	 * @param imports
	 */
	calculateRelevantClass(imports: string[]): string[] {
		const relevantImports = this.refineImportTypes(imports);

		return relevantImports.map(imp => {
			return this.calculateByPackageName(imp);
		});
	}

	private refineImportTypes(imports: string[]) {
		return imports.map(imp => {
			const impArr = imp.split(' ');
			return impArr[impArr.length - 1].replace(';', '');
		});
	}

	extractCurrentPackageName() {
		const query = JavaLangConfig.packageQuery!!.queryStr;
		const rootNode = this.tsfile.tree.rootNode;

		const matches = this.tsfile.language.query(query).matches(rootNode);

		if (matches.length === 0) {
			return '';
		}

		const packageNameNode = matches[0].captures[0].node;
		return packageNameNode.text;
	}

	/**
	 * Given a package name, if similar to current tsfile package, try to lookup in the codebase.
	 *
	 * For example, if the current file package name is `cc.unitmesh.untitled.demo.service`, the relevant package name
	 * is `cc.unitmesh.untitled.demo.repository`, then we can be according current filepath to lookup relevant class path;
	 */
	calculateByPackageName(packageName: string) {
		const packageArr = packageName.split('.');
		const tsFilePackageArr = this.extractCurrentPackageName().split('.');
		let relevantPath = '';
		for (let i = 0; i < tsFilePackageArr.length; i++) {
			if (tsFilePackageArr[i] !== packageArr[i]) {
				break;
			}
			relevantPath += tsFilePackageArr[i] + '/';
		}
		return relevantPath + packageArr.join('/');
	}
}
