import { TestStack } from "./TestStack";
import { SpringLibrary } from "./SpringLibrary";

export class SpringContextProvider {

	// todo: load after gradle init
	prepareLibrary(libraryDataList: any[]): TestStack {
		const testStack: TestStack = new TestStack();
		let hasMatchSpringMvc: boolean = false;
		let hasMatchSpringData: boolean = false;

		libraryDataList?.forEach(item => {
			const name: string = `${item.groupId}:${item.artifactId}`;

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