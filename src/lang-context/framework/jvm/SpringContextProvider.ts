import { injectable } from "inversify";

import { TechStack } from "./TechStack";
import { SpringLibrary } from "./SpringLibrary";
import { ChatContextItem, ChatContextProvider, ChatCreationContext } from "../../ChatContextProvider";
import { GradleBuildToolProvider } from "../../buildtool/GradleBuildToolProvider";
import { DependencyEntry } from "../../buildtool/_base/Dependence";

@injectable()
export class SpringContextProvider implements ChatContextProvider {
	async isApplicable(context: ChatCreationContext): Promise<boolean> {
		return context.language === "java" && GradleBuildToolProvider.instance().isApplicable();
	}

	async collect(context: ChatCreationContext): Promise<ChatContextItem[]> {
		let deps;
		try {
			deps = await GradleBuildToolProvider.instance().getDependencies();
		} catch (e) {
			console.error(e);
			return [];
		}

		let techStacks = this.prepareLibrary(deps.dependencies);
		if (techStacks.coreFrameworks.size === 0) {
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
					text: `You are working on a project that uses ${Array.from(techStacks.coreFrameworks.keys()).join(",")} to build RESTful APIs.`
				}
			];
		}

		if (isService()) {
			return [
				{
					clazz: SpringContextProvider.name,
					text: `You are working on a project that uses ${Array.from(techStacks.coreFrameworks.keys()).join(",")} to build business logic.`
				}
			];
		}

		return [];
	}

	prepareLibrary(libraryDataList: DependencyEntry[]): TechStack {
		const techStack: TechStack = new TechStack();
		libraryDataList?.forEach(item => {
			const name: string = item.name;

			SpringLibrary.SPRING_MVC.forEach(entry => {
				if (entry.coord === name) {
					techStack.coreFrameworks.set(entry.shortText, true);
				}
			});

			SpringLibrary.SPRING_DATA.forEach(entry => {
				if (entry.coords.includes(name)) {
					techStack.coreFrameworks.set(entry.shortText, true);
				}
			});

			switch (true) {
				case name.includes("org.springframework.boot:spring-boot-test"):
					techStack.testFrameworks.set("Spring Boot Test", true);
					break;
				case name.includes("org.assertj:assertj-core"):
					techStack.testFrameworks.set("AssertJ", true);
					break;
				case name.includes("org.junit.jupiter:junit-jupiter"):
					techStack.testFrameworks.set("JUnit 5", true);
					break;
				case name.includes("org.mockito:mockito-core"):
					techStack.testFrameworks.set("Mockito", true);
					break;
				case name.includes("com.h2database:h2"):
					techStack.testFrameworks.set("H2", true);
					break;
			}
		});

		// remove duplicate in coreFrameworks
		techStack.coreFrameworks = new Map(Array.from(techStack.coreFrameworks.keys()).map(key => [key, true]));
		// remove duplicate in testFrameworks
		techStack.testFrameworks = new Map(Array.from(techStack.testFrameworks.keys()).map(key => [key, true]));

		return techStack;
	}

}