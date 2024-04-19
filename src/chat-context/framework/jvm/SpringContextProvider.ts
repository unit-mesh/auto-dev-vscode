import { injectable } from "inversify";

import { TestStack } from "./TestStack";
import { SpringLibrary } from "./SpringLibrary";
import { ChatContextItem, ChatContextProvider, ChatCreationContext } from "../../ChatContextProvider";
import { GradleTooling } from "../../tooling/GradleTooling";
import { DependencyEntry } from "../../tooling/_base/Dependence";

@injectable()
export class SpringContextProvider extends ChatContextProvider {
	static name = "SpringContextProvider";

	isApplicable(context: ChatCreationContext): boolean {
		return context.language === "java";
	}

	async collect(context: ChatCreationContext): Promise<ChatContextItem[]> {
		const deps = await GradleTooling.instance().getDependencies();
		let testStack = this.prepareLibrary(deps.dependencies);

		if (testStack.testFrameworks.size === 0 && testStack.coreFrameworks.size === 0) {
			return [];
		}

		const fileName: string = context.filename;

		const isController = (): boolean => {
			return fileName.endsWith("Controller.java") || fileName.endsWith("Controller.kt");
		};

		const isService = (): boolean => {
			return fileName.endsWith("Service.java") || fileName.endsWith("ServiceImpl.java") || fileName.endsWith("Service.kt") || fileName.endsWith("ServiceImpl.kt");
		};

		if (isController()) {
			return [
				{
					clazz: SpringContextProvider.name,
					text: `You are working on a project that uses ${Array.from(testStack.coreFrameworks.keys()).join(",")} to build RESTful APIs.`
				}
			];
		}

		if (isService()) {
			return [
				{
					clazz: SpringContextProvider.name,
					text: `You are working on a project that uses ${Array.from(testStack.coreFrameworks.keys()).join(",")} to build business logic.`
				}
			];
		}

		return [];
	}

	prepareLibrary(libraryDataList: DependencyEntry[]): TestStack {
		const testStack: TestStack = new TestStack();
		let hasMatchSpringMvc: boolean = false;
		let hasMatchSpringData: boolean = false;

		libraryDataList?.forEach(item => {
			const name: string = `${item.group}:${item.artifact}`;

			if (!hasMatchSpringMvc) {
				SpringLibrary.SPRING_MVC.forEach(entry => {
					if (name.includes(entry.coords)) {
						testStack.coreFrameworks.set(entry.shortText, true);
						hasMatchSpringMvc = true;
					}
				});
			}

			if (!hasMatchSpringData) {
				SpringLibrary.SPRING_DATA.forEach(entry => {
					entry.coords.forEach(coord => {
						if (name.includes(coord)) {
							testStack.coreFrameworks.set(entry.shortText, true);
							hasMatchSpringData = true;
						}
					});
				});
			}

			switch (true) {
				case name.includes("org.springframework.boot:spring-boot-test"):
					testStack.testFrameworks.set("Spring Boot Test", true);
					break;
				case name.includes("org.assertj:assertj-core"):
					testStack.testFrameworks.set("AssertJ", true);
					break;
				case name.includes("org.junit.jupiter:junit-jupiter"):
					testStack.testFrameworks.set("JUnit 5", true);
					break;
				case name.includes("org.mockito:mockito-core"):
					testStack.testFrameworks.set("Mockito", true);
					break;
				case name.includes("com.h2database:h2"):
					testStack.testFrameworks.set("H2", true);
					break;
			}
		});

		return testStack;
	}

}