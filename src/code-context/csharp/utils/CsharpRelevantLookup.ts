import { LanguageProfileUtil } from '../../_base/LanguageProfile';
import { TreeSitterFile } from '../../ast/TreeSitterFile';

export class CsharpRelevantLookup {
	tsfile: TreeSitterFile;

	constructor(tsfile: TreeSitterFile) {
		this.tsfile = tsfile;
	}

  /**
   *“relevantImportToFilePath”方法用于从给定的导入中筛选出相关类并返回其文件路径。
   *
   *@param import 这是一个字符串数组，其中每个字符串代表一个导入语句。
	 *
   * @return 此方法返回一个字符串数组，其中每个字符串都是相关导入的文件路径。
   *
   *该方法首先通过调用“imports”参数上的“refineImportTypes”方法来细化导入类型。“refineImportTypes”方法预计将返回一个相关导入的数组。
   *
   *然后，它映射相关导入的数组，并为每个导入调用`pathByPackageName`方法。`pathByPackageName`方法应返回导入的文件路径。
   *
   *然后，`relevantImportToFilePath`方法返回生成的文件路径数组。
   *
   *注意：此代码段中未定义“refineImportTypes”和“pathByPackageName”方法。它们应在规范的其他地方定义，并应按照要求使用。
   **/
	relevantImportToFilePath(imports: string[]): string[] {
		const relevantImports = this.refineImportTypes(imports);

		let packages = relevantImports.map(imp => {
			return this.pathByPackageName(imp);
		});

		//return packages.filter(p => !this.isCsharpFrameworks(p));
		return packages;
	}

	// isCsharpFrameworks(imp: string) {
	// 	let javaImport = imp.startsWith('java.') || imp.startsWith('javax.');
	// 	let isSpringImport = imp.startsWith('org.springframework');
	// 	return javaImport || isSpringImport;
	// }

	private refineImportTypes(imports: string[]) {
		return imports.map(imp => {
			const impArr = imp.split(' ');
			return impArr[impArr.length - 1].replace(';', '');
		});
	}

	extractCurrentPackageName() {
		let languageProfile = LanguageProfileUtil.from('csharp')!!;

		const query = languageProfile.packageQuery?.query(this.tsfile.tsLanguage)!!;
		const matches = query.matches(this.tsfile.tree.rootNode);

		if (matches.length === 0) {
			return '';
		}

		const packageNameNode = matches[0].captures[0].node;
		return packageNameNode.text;
	}




	/**
	*给定一个包名，如果与当前的tsfile包相似，请尝试在代码库中查找。
	*
	*例如，如果当前文件包名为“cc.unitmesh.unttled.demo.service”，则相关的包名
	*是`cc.unitmesh.unttled.demo.repository`，那么我们可以根据当前的文件路径查找相关的类路径；
	**/
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
		const lang = currentPath.split('src/main')?.[1]?.split('/')?.[1] || 'cs';

		return `${projectPath}src/main/${lang}/${packagePath}.cs`;
	}
}
