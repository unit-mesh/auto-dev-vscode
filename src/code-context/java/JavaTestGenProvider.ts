import vscode, { l10n } from "vscode";
import { injectable } from "inversify";
import path from "path";

import { TestGenProvider } from "../_base/test/TestGenProvider";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { AutoTestTemplateContext } from "../_base/test/AutoTestTemplateContext";
import { GradleBuildToolProvider } from "../../toolchain-context/buildtool/GradleBuildToolProvider";
import { ToolchainContextItem } from "../../toolchain-context/ToolchainContextProvider";
import { TestTemplateFinder } from "../TestTemplateFinder";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { NamedElement } from "../../editor/ast/NamedElement";
import { ScopeGraph } from "../../code-search/scope-graph/ScopeGraph";
import { documentToTreeSitterFile } from "../ast/TreeSitterFileUtil";
import { TreeSitterFile } from "../ast/TreeSitterFile";
import { JavaCodeCorrector } from "./utils/JavaCodeCorrector";
import { JavaStructurerProvider } from "./JavaStructurerProvider";
import { CommentedUmlPresenter } from "../../editor/codemodel/presenter/CommentedUmlPresenter";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";

@injectable()
export class JavaTestGenProvider implements TestGenProvider {
	baseTestPrompt: string = `${l10n.t("lang.java.prompt.basicTestTemplate")}`.trim();
	importRegex = /import\s+([\w.]+);/g;

	private clazzName = this.constructor.name;

	private graph: ScopeGraph | undefined;
	private tsfile: TreeSitterFile | undefined;
	private context: AutoTestTemplateContext | undefined;
	private languageService: TSLanguageService | undefined;
	private packageName = "";

	constructor() {
	}

	isApplicable(lang: SupportedLanguage): boolean {
		return lang === "java";
	}

	async setupLanguage(defaultLanguageService: TSLanguageService, context?: AutoTestTemplateContext) {
		this.languageService = defaultLanguageService;
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
	async setupTestFile(document: vscode.TextDocument, element: NamedElement): Promise<AutoTestTemplateContext> {
		this.tsfile = await documentToTreeSitterFile(document);
		this.graph = await this.tsfile.scopeGraph();

		let query = this.tsfile.languageProfile.packageQuery!!.query(this.tsfile.tsLanguage);
		let matches = query.captures(this.tsfile.tree.rootNode);
		if (matches.length > 0) {
			this.packageName = matches[0].node.text;
		}

		const targetPath = document.fileName
			.replace(".java", "Test.java")
			.replace("src/main/java", "src/test/java");

		let filename = path.basename(document.uri.fsPath);
		let classname = filename.replace(".java", "");

		let structurerProvider = new JavaStructurerProvider();
		await structurerProvider.init(new DefaultLanguageService());

		let codeFile = await structurerProvider.parseFile(document.getText(), document.fileName);
		let currentClass = codeFile?.classes.find((clazz) => clazz.name === classname);

		const testContext: AutoTestTemplateContext = {
			filename: filename,
			language: document.languageId,
			targetPath: targetPath,
			underTestClassName: classname,
			targetTestClassName: classname + "Test",
			sourceCode: element.blockRange.text,
			relatedClasses: "",
			currentClass: new CommentedUmlPresenter().presentClass(currentClass!!, "java"),
			chatContext: "",
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
		let codeFixer = new JavaCodeCorrector(document, output, this.packageName, this.context!!.targetTestClassName!!);
		await codeFixer.correct();
	}

	async collect(context: AutoTestTemplateContext): Promise<ToolchainContextItem[]> {
		const fileName = context.filename;

		if (context && context.imports === undefined) {
			context.imports = [];
		}

		let isSpringRelated = true;
		if (context) {
			const imports = this.importRegex.exec(context.sourceCode!!);
			const importStrings = imports?.map((imp) => imp[1]) ?? [];
			context!!.imports = imports?.map((imp) => imp[1]) ?? [];
			if (this.context) {
				this.context.imports = context.imports;
			}

			isSpringRelated = this.checkIsSpringRelated(importStrings) ?? false;
		}

		let prompt = this.baseTestPrompt + await this.determineJUnitVersion();

		const testPrompt = new TestTemplateFinder();
		let finalPrompt: ToolchainContextItem;

		if (this.isController(fileName) && isSpringRelated) {
			let testControllerPrompt = prompt + `\n${l10n.t("lang.java.prompt.testForController")}\n`.trim();

			const lookup = testPrompt.lookup("ControllerTest.java");
			if (lookup !== null) {
				testControllerPrompt += `\nTest code template:\n\`\`\`java\n${lookup}\n\`\`\`\n`;
			}

			finalPrompt = { clazz: this.clazzName, text: testControllerPrompt };
		} else if (this.isService(fileName) && isSpringRelated) {
			let testServicePrompt = prompt + `\n${l10n.t("lang.java.prompt.testForService")}\n`.trim();

			const lookup = testPrompt.lookup("ServiceTest.java");
			if (lookup !== null) {
				testServicePrompt += `\nTest code template:\n\`\`\`java\n${lookup}\n\`\`\`\n`;
			}

			finalPrompt = { clazz: this.clazzName, text: testServicePrompt };
		} else {
			const lookup = testPrompt.lookup("Test.java");
			if (lookup !== null) {
				prompt += `\nTest code template:\n\`\`\`java\n${lookup}\n\`\`\`\n`;
			}
			finalPrompt = { clazz: this.clazzName, text: prompt };
		}

		return [finalPrompt];
	}

	protected isService(fileName: string | null): boolean {
		return fileName !== null && MvcUtil.isService(fileName, "java");
	}

	protected isController(fileName: string | null): boolean {
		return fileName !== null && MvcUtil.isController(fileName, "java");
	}

	async determineJUnitVersion(): Promise<string> {
		let dependencies = await GradleBuildToolProvider.instance().getDependencies();
		let rule = "";
		let hasJunit5 = false;
		let hasJunit4 = false;

		const libraryData = dependencies.dependencies;
		if (libraryData) {
			for (const lib of libraryData) {
				if (lib.group === "org.junit.jupiter") {
					hasJunit5 = true;
					break;
				}

				if (lib.group === "junit") {
					hasJunit4 = true;
					break;
				}
			}
		}

		if (hasJunit5) {
			rule = l10n.t("lang.java.prompt.useJunit5");
		} else if (hasJunit4) {
			rule = l10n.t("lang.java.prompt.useJunit4");
		}

		return rule;
	}

	private checkIsSpringRelated(imports: string[]) {
		for (const imp of imports) {
			if (imp.startsWith("org.springframework")) {
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
