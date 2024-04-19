import { injectable } from "inversify";

import { TestGenProvider } from "../_base/test/TestGenProvider";
import { CodeFile, CodeStructure } from "../../editor/codemodel/CodeFile";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { TestGenContext } from "../_base/test/TestGenContext";
import { GradleBuildToolProvider } from "../../chat-context/tooling/GradleBuildToolProvider";
import { ChatContextItem, ChatCreationContext } from "../../chat-context/ChatContextProvider";
import { MvcUtil } from "./JavaMvcUtil";
import { TestTemplateFinder } from "../TestTemplateFinder";
import { t } from "@vscode/l10n";

@injectable()
export class JavaTestGenProvider implements TestGenProvider {
	private context: TestGenContext | undefined;
	private languageService: TSLanguageService | undefined;

	constructor() {

	}

	async setup(defaultLanguageService: TSLanguageService, context?: TestGenContext) {
		this.languageService = defaultLanguageService;
		this.context = context;
	}

	findOrCreateTestFile(sourceFile: CodeFile, element: any): Promise<TestGenContext> {
		return Promise.resolve(this.context!!);
	}

	lookupRelevantClass(element: any): Promise<CodeStructure> {
		throw new Error("Method not implemented.");
	}

	baseTestPrompt: string = `${t("lang.java.prompt.basicTestTemplate")}`.trim();

	// wirte a regex for java import statement
	importRegex = /import\s+([\w.]+);/g;

	async collect(creationContext: ChatCreationContext): Promise<ChatContextItem[]> {
		const fileName = creationContext.filename;

		// let isSpringRelated = this.checkIsSpringRelated(creationContext.element ?? );
		let isSpringRelated = true;
		if (creationContext) {
			const imports = this.importRegex.exec(creationContext.content);
			const importStrings = imports?.map((imp) => imp[1]) ?? [];
			isSpringRelated = this.checkIsSpringRelated(importStrings) ?? false;
		}

		let prompt = this.baseTestPrompt + await this.junitRule();

		const testPrompt = new TestTemplateFinder();
		let finalPrompt: ChatContextItem;

		if (this.isController(fileName) && isSpringRelated) {
			let testControllerPrompt = prompt + `\n${t("lang.java.prompt.testForController")}\n`.trim();

			const lookup = testPrompt.lookup("ControllerTest.java");
			if (lookup !== null) {
				testControllerPrompt += `\nTest code template:\n\`\`\`java\n${lookup}\n\`\`\`\n`;
			}

			finalPrompt = { clazz: "JavaTestContextProvider", text: testControllerPrompt };
		} else if (this.isService(fileName) && isSpringRelated) {
			let testServicePrompt = prompt + `\n${t("lang.java.prompt.testForService")}\n`.trim();

			const lookup = testPrompt.lookup("ServiceTest.java");
			if (lookup !== null) {
				testServicePrompt += `\nTest code template:\n\`\`\`java\n${lookup}\n\`\`\`\n`;
			}

			finalPrompt = { clazz: "JavaTestContextProvider", text: testServicePrompt };
		} else {
			const lookup = testPrompt.lookup("Test.java");
			if (lookup !== null) {
				prompt += `\nTest code template:\n\`\`\`java\n${lookup}\n\`\`\`\n`;
			}
			finalPrompt = { clazz: "JavaTestContextProvider", text: prompt };
		}

		return [finalPrompt];
	}

	protected isService(fileName: string | null): boolean {
		return fileName !== null && MvcUtil.isService(fileName, "java");
	}

	protected isController(fileName: string | null): boolean {
		return fileName !== null && MvcUtil.isController(fileName, "java");
	}

	async junitRule(): Promise<string> {
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
			rule = t("lang.java.prompt.useJunit5");
		} else if (hasJunit4) {
			rule = t("lang.java.prompt.useJunit4");
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