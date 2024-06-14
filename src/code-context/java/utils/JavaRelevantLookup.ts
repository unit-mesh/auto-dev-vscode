import { LanguageProfileUtil } from '../../_base/LanguageProfile';
import { TreeSitterFile } from '../../ast/TreeSitterFile';

export class JavaRelevantLookup {
	tsfile: TreeSitterFile;

	constructor(tsfile: TreeSitterFile) {
		this.tsfile = tsfile;
	}

	/**
	 * The `relevantImportToFilePath` method is used to filter out the relevant class from the given imports and return their file paths.
	 *
	 * @param imports This is an array of strings where each string represents an import statement.
	 *
	 * @returns This method returns an array of strings where each string is the file path of the relevant import.
	 *
	 * The method first refines the import types by calling the `refineImportTypes` method on the `imports` parameter. The `refineImportTypes` method is expected to return an array of relevant imports.
	 *
	 * Then, it maps over the array of relevant imports and for each import, it calls the `pathByPackageName` method. The `pathByPackageName` method is expected to return the file path of the import.
	 *
	 * The resulting array of file paths is then returned by the `relevantImportToFilePath` method.
	 *
	 * Note: The `refineImportTypes` and `pathByPackageName` methods are not defined in this snippet. They should be defined elsewhere in the code and should be used as per the requirements.
	 */
	relevantImportToFilePath(imports: string[]): string[] {
		const relevantImports = this.refineImportTypes(imports);

		let packages = relevantImports.map(imp => {
			return this.pathByPackageName(imp);
		});

		return packages.filter(p => !this.isJavaFrameworks(p));
	}

	isJavaFrameworks(imp: string) {
		let javaImport = imp.startsWith('java.') || imp.startsWith('javax.');
		let isSpringImport = imp.startsWith('org.springframework');
		return javaImport || isSpringImport;
	}

	private refineImportTypes(imports: string[]) {
		return imports.map(imp => {
			const impArr = imp.split(' ');
			return impArr[impArr.length - 1].replace(';', '');
		});
	}

	extractCurrentPackageName() {
		let languageProfile = LanguageProfileUtil.from('java')!!;

		const query = languageProfile.packageQuery?.query(this.tsfile.tsLanguage)!!;
		const matches = query.matches(this.tsfile.tree.rootNode);

		if (matches.length === 0) {
			return '';
		}

		const packageNameNode = matches[0].captures[0].node;
		return packageNameNode.text;
	}

	/**
	 * Given a package name, if similar to the current tsfile package, try to look up in the codebase.
	 *
	 * For example, if the current file package name is `cc.unitmesh.untitled.demo.service`, the relevant package name
	 * is `cc.unitmesh.untitled.demo.repository`, then we can be according current filepath to look up a relevant class path;
	 */
	pathByPackageName(packageName: string) {
		let currentPath = this.tsfile.filePath;
		const currentPackageName = this.extractCurrentPackageName();
		if (currentPackageName === '') {
			return '';
		}

		// let projectPath = currentPath.split('src/main/java')[0];
		// we need to support kotlin, scala file path as well, which is src/main/kotlin
		let projectPath = currentPath.split('src/main')[0];
		const packagePath = packageName.replace(/\./g, '/');
		const lang = currentPath.split('src/main')?.[1]?.split('/')?.[1] || 'java';

		return `${projectPath}src/main/${lang}/${packagePath}.java`;
	}
}
