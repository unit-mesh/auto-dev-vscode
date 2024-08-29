import { inject, injectable } from 'inversify';
import path from 'path';
import vscode, { l10n } from 'vscode';

import { LanguageIdentifier } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { ScopeGraph } from '../../code-search/scope-graph/ScopeGraph';
import { NamedElement } from '../../editor/ast/NamedElement';
import { TreeSitterFileManager } from '../../editor/cache/TreeSitterFileManager';
import { CommentedUmlPresenter } from '../../editor/codemodel/presenter/CommentedUmlPresenter';
import { GradleBuildToolProvider } from '../../toolchain-context/buildtool/GradleBuildToolProvider';
import { ToolchainContextItem } from '../../toolchain-context/ToolchainContextProvider';
import { AutoTestTemplateContext } from '../_base/test/AutoTestTemplateContext';
import { TestGenProvider } from '../_base/test/TestGenProvider';
import { TestTemplateManager } from '../_lookup/TestTemplateManager';
import { TreeSitterFile } from '../ast/TreeSitterFile';
import { CsharpCodeCorrector } from './CsharpCodeCorrector';
import { CsharpStructurerProvider } from './CsharpStructurerProvider';

@injectable()
export class CsharpTestGenProvider implements TestGenProvider {
	baseTestPrompt: string = `${l10n.t('lang.java.prompt.basicTestTemplate')}`.trim();
	importRegex = /import\s+([\w.]+);/g;

	private clazzName = this.constructor.name;

	private graph: ScopeGraph | undefined;
	private tsfile: TreeSitterFile | undefined;
	private context: AutoTestTemplateContext | undefined;
	private packageName = '';

	private lsp!: ILanguageServiceProvider;
	private treeSitterFileManager!: TreeSitterFileManager;

	constructor() {}

	isApplicable(lang: LanguageIdentifier): boolean {
		return lang === 'csharp';
	}

	async setupLanguage(lsp: ILanguageServiceProvider, context?: AutoTestTemplateContext) {
		this.lsp = lsp;

		// TODO hack, after move
		this.treeSitterFileManager = new TreeSitterFileManager(lsp);
		this.context = context;
	}

	/**
	 * The `setupTestFile` method is an asynchronous function that sets up a test file for a given document and named element.
	 *
	 * @param {vscode.TextDocument} document - The document for which the test file is to be set up.
	 * @param {NamedElement} element - The named element for which the test file is to be set up.
	 *
	 * @returns {Promise<AutoTestTemplateContext>} - Returns a promise that resolves to an AutoTestTemplateContext object.
	 *
	 * The method first converts the document to a TreeSitterFile and generates a scope graph for it. It then constructs a target path for the test file by replacing ".java" with "Test.java" and "src/main/java" with "src/test/java" in the document's file name.
	 *
	 * An AutoTestTemplateContext object is then created with the following properties:
	 * - filename: The file name of the document.
	 * - language: The language ID of the document.
	 * - targetPath: The target path for the test file.
	 * - testClassName: The text of the identifier range of the named element.
	 * - sourceCode: The text of the block range of the named element.
	 * - relatedClasses: An empty array.
	 * - imports: An empty array.
	 *
	 * The method then creates a URI for the target path and writes an empty file to it in the workspace's file system.
	 *
	 * Finally, the method returns a promise that resolves to the created AutoTestTemplateContext object.
	 */



	/**
	 *
	 * @param document -要为其设置测试文件的文档。
	 * @param element  -要为其设置测试文件的命名元素。
	 * @returns {Promise<AutoTestTemplateContext>} -返回一个解析为AutoTestTemplateContext对象的promise。
	 *
	 * 该方法的工作原理是首先在源代码中找到与给定范围对应的语法节点。然后，它使用查询来捕获方法的返回类型和参数类型。对于每个捕获的元素，它从源代码中获取相应的导入语句并将其添加到数组中。最后，在返回数组之前，它会从数组中删除任何重复的导入语句。**该方法使用`fetchImportsWithinScope`方法从源代码中获取给定语法节点的导入声明。**注意：该方法假设定义了`config`对象的`methodIOQuery`和`language`属性。
	 *
	 * 该方法首先将文档转换为TreeSitterFile并为其生成作用域图。然后，通过在文档文件名中将“.java”替换为“test.java”，将“src/main/java”替换为”src/test/java“，为测试文件构建目标路径。
	 *
	 * 然后创建具有以下属性的AutoTestTemplateContext对象：
	 * filename：文档的文件名。
	 * -language：文档的语言ID。
	 * -targetPath：测试文件的目标路径。
	 * -testClassName：命名元素的标识符范围的文本。
	 * -sourceCode：指定元素的块范围的文本。
	 * -relatedClasses：一个空数组。
	 * -imports：一个空数组。
	 *
	 * 然后，该方法为目标路径创建一个URI，并在工作区的文件系统中向其写入一个空文件。
	 *
	 * 最后，该方法返回一个promise，该promise解析为创建的AutoTestTemplateContext对象。
*/
	async setupTestFile(document: vscode.TextDocument, element: NamedElement): Promise<AutoTestTemplateContext> {
		this.tsfile = await this.treeSitterFileManager.create(document);
		this.graph = await this.tsfile.scopeGraph();

		let query = this.tsfile.languageProfile.packageQuery!!.query(this.tsfile.tsLanguage);
		let matches = query.captures(this.tsfile.tree.rootNode);
		if (matches.length > 0) {
			this.packageName = matches[0].node.text;
		}

		const targetPath = document.fileName.replace('.java', 'Test.java').replace('src/main/java', 'src/test/java');

		let filename = path.basename(document.uri.fsPath);
		let classname = filename.replace('.java', '');

		let structurerProvider = new CsharpStructurerProvider();
		await structurerProvider.init(this.lsp);

		let codeFile = await structurerProvider.parseFile(document.getText(), document.fileName);
		let currentClass = codeFile?.classes.find(clazz => clazz.name === classname);

		const testContext: AutoTestTemplateContext = {
			filename: filename,
			language: document.languageId,
			targetPath: targetPath,
			underTestClassName: classname,
			targetTestClassName: classname + 'Test',
			sourceCode: element.blockRange.text,
			relatedClasses: '',
			currentClass: new CommentedUmlPresenter().presentClass(currentClass!!, 'java'),
			chatContext: '',
			imports: [],
		};

		const targetUri = vscode.Uri.file(targetPath);
		await vscode.workspace.fs.writeFile(targetUri, new Uint8Array());
		this.context = testContext;
		return Promise.resolve(testContext);
	}

	/**
	 * after test file is created, try to fix the code, like packageName and className, etc.
	 */
	async postProcessCodeFix(document: vscode.TextDocument, output: string): Promise<void> {
		let codeFixer = new CsharpCodeCorrector(
			{
				document: document,
				sourcecode: output,
				packageName: this.packageName,
				targetClassName: this.context!!.targetTestClassName!!,
			},
			this.lsp,
		);

		await codeFixer.correct();
	}

	/**
	 * addition test context
	 * @param context
	 */
	async additionalTestContext(context: AutoTestTemplateContext): Promise<ToolchainContextItem[]> {
		const fileName = context.filename;

		if (context && context.imports === undefined) {
			context.imports = [];
		}

		let isSpringRelated = true;
		if (context) {
			const imports = this.importRegex.exec(context.sourceCode!!);
			const importStrings = imports?.map(imp => imp[1]) ?? [];
			context!!.imports = imports?.map(imp => imp[1]) ?? [];
			if (this.context) {
				this.context.imports = context.imports;
			}

			isSpringRelated = this.checkIsSpringRelated(importStrings) ?? false;
		}

		let prompt = this.baseTestPrompt + (await this.determineJUnitVersion());

		const testPrompt = new TestTemplateManager();
		let finalPrompt: ToolchainContextItem;

		if (this.isController(fileName) && isSpringRelated) {
			let testControllerPrompt = prompt + `\n${l10n.t('lang.java.prompt.testForController')}\n`.trim();

			const lookup = testPrompt.lookup('ControllerTest.java');
			if (lookup !== null) {
				testControllerPrompt += `\nTest code template:\n\`\`\`java\n${lookup}\n\`\`\`\n`;
			}

			finalPrompt = { clazz: this.clazzName, text: testControllerPrompt };
		} else if (this.isService(fileName) && isSpringRelated) {
			let testServicePrompt = prompt + `\n${l10n.t('lang.java.prompt.testForService')}\n`.trim();

			const lookup = testPrompt.lookup('ServiceTest.java');
			if (lookup !== null) {
				testServicePrompt += `\nTest code template:\n\`\`\`java\n${lookup}\n\`\`\`\n`;
			}

			finalPrompt = { clazz: this.clazzName, text: testServicePrompt };
		} else {
			const lookup = testPrompt.lookup('Test.java');
			if (lookup !== null) {
				prompt += `\nTest code template:\n\`\`\`java\n${lookup}\n\`\`\`\n`;
			}
			finalPrompt = { clazz: this.clazzName, text: prompt };
		}

		return [finalPrompt];
	}

	protected isService(fileName: string | null): boolean {
		return fileName !== null && MvcUtil.isService(fileName, 'java');
	}

	protected isController(fileName: string | null): boolean {
		return fileName !== null && MvcUtil.isController(fileName, 'java');
	}

	async determineJUnitVersion(): Promise<string> {
		let dependencies = await GradleBuildToolProvider.instance().getDependencies();
		let rule = '';
		let hasJunit5 = false;
		let hasJunit4 = false;

		const libraryData = dependencies.dependencies;
		if (libraryData) {
			for (const lib of libraryData) {
				if (lib.group === 'org.junit.jupiter') {
					hasJunit5 = true;
					break;
				}

				if (lib.group === 'junit') {
					hasJunit4 = true;
					break;
				}
			}
		}

		if (hasJunit5) {
			rule = l10n.t('lang.java.prompt.useJunit5');
		} else if (hasJunit4) {
			rule = l10n.t('lang.java.prompt.useJunit4');
		}

		return rule;
	}

	private checkIsSpringRelated(imports: string[]) {
		for (const imp of imports) {
			if (imp.startsWith('org.springframework')) {
				return true;
			}
		}
	}
}

export namespace MvcUtil {
	export function isController(fileName: string, lang: string): boolean {
		return fileName.endsWith(`Controller.${lang.toLowerCase()}`);
	}

	export function isService(fileName: string, lang: string): boolean {
		return fileName.endsWith(`Service.${lang.toLowerCase()}`) || fileName.endsWith(`ServiceImpl.${lang.toLowerCase()}`);
	}

	export function isRepository(fileName: string, lang: string): boolean {
		return fileName.endsWith(`Repository.${lang.toLowerCase()}`) || fileName.endsWith(`Repo.${lang.toLowerCase()}`);
	}
}
