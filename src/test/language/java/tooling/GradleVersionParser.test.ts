import { GradleVersionParser } from "../../../../toolchain-context/buildtool/gradle/GradleVersionParser";
import { DEP_SCOPE } from "../../../../toolchain-context/buildtool/_base/Dependence";

describe('GradleVersionParser', () => {
	let parser: GradleVersionParser;

	beforeEach(() => {
		parser = new GradleVersionParser();
	});

	test('normal_match', () => {
		const gradleSample = `
sourceCompatibility = 1.8
targetCompatibility = 1.8

dependencies {
    implementation "joda-time:joda-time:2.2"
    testImplementation "junit:junit:4.12"
}
    `;

		const dependencies = parser.retrieveDependencyData(gradleSample)[0].dependencies;

		expect(dependencies.length).toBe(2);
		expect(dependencies[0].name).toBe("joda-time:joda-time");
		expect(dependencies[0].version).toBe("2.2");
		expect(dependencies[0].group).toBe("joda-time");
		expect(dependencies[0].artifact).toBe("joda-time");
		expect(dependencies[0].scope).toBe(DEP_SCOPE.NORMAL);

		expect(dependencies[1].group).toBe("junit");
		expect(dependencies[1].artifact).toBe("junit");
		expect(dependencies[1].version).toBe("4.12");
		expect(dependencies[1].scope).toBe(DEP_SCOPE.TEST);
	});

	test('keyword_arg', () => {
		const gradleSample = `
dependencies {
    runtimeOnly(group = "org.springframework", name = "spring-core", version = "2.5")
}
`;

		const dependencies = parser.retrieveDependencyData(gradleSample)[0].dependencies;
		console.log(dependencies);

		expect(dependencies.length).toBe(1);
		expect(dependencies[0].group).toBe("org.springframework");
		expect(dependencies[0].artifact).toBe("spring-core");
		expect(dependencies[0].version).toBe("2.5");
		expect(dependencies[0].scope).toBe(DEP_SCOPE.RUNTIME);
	});

	test('dependency_set', () => {
		const gradleSample = `
dependencySet(group:'org.slf4j', version: '1.7.7') { 
    entry 'slf4j-api' 
}
`;

		const dependencies = parser.retrieveDependencyData(gradleSample)[0].dependencies;

		expect(dependencies.length).toBe(1);
		expect(dependencies[0].artifact).toBe("slf4j-api");
		expect(dependencies[0].version).toBe("1.7.7");
	});

	test('dependency_set_multiple', () => {
		const gradleSample = `
dependencySet(group:'org.slf4j', version: '1.7.7') {
    entry 'slf4j-api'
    entry 'slf4j-simple'
}`;

		const dependencies = parser.retrieveDependencyData(gradleSample)[0].dependencies;

		expect(dependencies.length).toBe(2);
		expect(dependencies[0].artifact).toBe("slf4j-api");
		expect(dependencies[0].version).toBe("1.7.7");

		expect(dependencies[1].artifact).toBe("slf4j-simple");
		expect(dependencies[1].version).toBe("1.7.7");
	});

	test('error_single_line', () => {
		const gradleSample = `
libraries.junitJupiterApi = "org.junit.jupiter:junit-jupiter-api:4.4.0"
`;

		const dependencies = parser.retrieveDependencyData(gradleSample)[0].dependencies;
		expect(dependencies.length).toBe(0);
	});

	test('single_line_with_scope', () => {
		const gradleSample = `
dependencies {
    implementation(projects.metaAction)
    implementation(libs.kotlin.stdlib)

    implementation(libs.bundles.openai)

    implementation(libs.onnxruntime)
    implementation(libs.huggingface.tokenizers)
    implementation(libs.jtokkit)

    testImplementation(libs.bundles.test)
    testRuntimeOnly(libs.test.junit.engine)
}
`;
		const dependencies = parser.retrieveDependencyData(gradleSample)[0].dependencies;
    console.log(dependencies);

		expect(dependencies.length).toBe(7);
		expect(dependencies[0].name).toBe("libs.kotlin.stdlib");
	});
});
