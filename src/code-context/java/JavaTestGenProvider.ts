import { injectable } from "inversify";

import { TestGenProvider } from "../_base/test/TestGenProvider";
import { CodeFile, CodeStructure } from "../../editor/codemodel/CodeFile";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { TestGenContext } from "../_base/test/TestGenContext";
import { GradleBuildToolProvider } from "../../chat-context/tooling/GradleBuildToolProvider";
import { ChatContextItem, ChatCreationContext } from "../../chat-context/ChatContextProvider";
import { MvcUtil } from "./JavaMvcUtil";
import { TestTemplateFinder } from "../TestTemplateFinder";

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


	baseTestPrompt: string = `
            |- You MUST use should_xx_xx style for test method name, You MUST use given-when-then style.
            |- Test file should be complete and compilable, without need for further actions.
            |- Ensure that each test focuses on a single use case to maintain clarity and readability.
            |- Instead of using \`@BeforeEach\` methods for setup, include all necessary code initialization within each individual test method, do not write parameterized tests.
            |`.trim();

	async collect(creationContext: ChatCreationContext): Promise<ChatContextItem[]> {
		const fileName = creationContext.filename;

		// let isSpringRelated = this.checkIsSpringRelated(creationContext.element ?? );
		let isSpringRelated = true;
		// if ((typeof creationContext.element) === CodeFile) {
		// 	isSpringRelated = this.checkIsSpringRelated(creationContext.element);
		// }

		let prompt = this.baseTestPrompt + this.junitRule();

		const language = "Java";

		const testPrompt = new TestTemplateFinder();
		let finalPrompt: ChatContextItem;

		if (this.isController(fileName) && isSpringRelated) {
			let testControllerPrompt = prompt + `
                        |- Use appropriate Spring test annotations such as \`@MockBean\`, \`@Autowired\`, \`@WebMvcTest\`, \`@DataJpaTest\`, \`@AutoConfigureTestDatabase\`, \`@AutoConfigureMockMvc\`, \`@SpringBootTest\` etc.
                        |`.trim();

			const lookup = testPrompt.lookup("ControllerTest.java");
			if (lookup !== null) {
				testControllerPrompt += `\nHere is the Test code template as example\n\`\`\`${language}\n${lookup}\n\`\`\`\n`;
			}

			finalPrompt = { clazz: "JavaTestContextProvider", text: testControllerPrompt };
		} else if (this.isService(fileName) && isSpringRelated) {
			let testServicePrompt = prompt + `
                        |- Follow the common Spring code style by using the AssertJ library.
                        |- Assume that the database is empty before each test and create valid entities with consideration for data constraints (jakarta.validation.constraints).
                        |`.trim();

			const lookup = testPrompt.lookup("ServiceTest.java");
			if (lookup !== null) {
				testServicePrompt += `\nHere is the Test code template as example\n\`\`\`${language}\n${lookup}\n\`\`\`\n`;
			}

			finalPrompt = { clazz: "JavaTestContextProvider", text: testServicePrompt };
		} else {
			const lookup = testPrompt.lookup("Test.java");
			if (lookup !== null) {
				prompt += `\nHere is the Test code template as example\n\`\`\`${language}\n${lookup}\n\`\`\`\n`;
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
			rule = "- This project uses JUnit 5, you should import `org.junit.jupiter.api.Test` and use `@Test` annotation.";
		} else if (hasJunit4) {
			rule = "- This project uses JUnit 4, you should import `org.junit.Test` and use `@Test` annotation.";
		}

		return rule;
	}

	private checkIsSpringRelated(codeFile: CodeFile) {
		const imports = codeFile.imports;
		for (const imp of imports) {
			if (imp.startsWith("org.springframework")) {
				return true;
			}
		}
	}
}