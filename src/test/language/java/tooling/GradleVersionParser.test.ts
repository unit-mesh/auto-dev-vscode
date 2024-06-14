import { DEP_SCOPE } from '../../../../toolchain-context/buildtool/_base/Dependence';
import { GradleDependencyInspector } from '../../../../toolchain-context/buildtool/gradle/GradleDependencyInspector';

describe('GradleVersionParser', () => {
	let parser: GradleDependencyInspector;

	beforeEach(() => {
		parser = new GradleDependencyInspector();
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

		const dependencies = parser.parseDependency(gradleSample)[0].dependencies;

		expect(dependencies.length).toBe(2);
		expect(dependencies[0].name).toBe('joda-time:joda-time');
		expect(dependencies[0].version).toBe('2.2');
		expect(dependencies[0].group).toBe('joda-time');
		expect(dependencies[0].artifact).toBe('joda-time');
		expect(dependencies[0].scope).toBe(DEP_SCOPE.NORMAL);

		expect(dependencies[1].group).toBe('junit');
		expect(dependencies[1].artifact).toBe('junit');
		expect(dependencies[1].version).toBe('4.12');
		expect(dependencies[1].scope).toBe(DEP_SCOPE.TEST);
	});

	test('keyword_arg', () => {
		const gradleSample = `
dependencies {
    runtimeOnly(group = "org.springframework", name = "spring-core", version = "2.5")
}
`;

		const dependencies = parser.parseDependency(gradleSample)[0].dependencies;

		expect(dependencies.length).toBe(1);
		expect(dependencies[0].group).toBe('org.springframework');
		expect(dependencies[0].artifact).toBe('spring-core');
		expect(dependencies[0].version).toBe('2.5');
		expect(dependencies[0].scope).toBe(DEP_SCOPE.RUNTIME);
	});

	test('dependency_set', () => {
		const gradleSample = `
dependencySet(group:'org.slf4j', version: '1.7.7') { 
    entry 'slf4j-api' 
}
`;

		const dependencies = parser.parseDependency(gradleSample)[0].dependencies;

		expect(dependencies.length).toBe(1);
		expect(dependencies[0].artifact).toBe('slf4j-api');
		expect(dependencies[0].version).toBe('1.7.7');
	});

	test('dependency_set_multiple', () => {
		const gradleSample = `
dependencySet(group:'org.slf4j', version: '1.7.7') {
    entry 'slf4j-api'
    entry 'slf4j-simple'
}`;

		const dependencies = parser.parseDependency(gradleSample)[0].dependencies;

		expect(dependencies.length).toBe(2);
		expect(dependencies[0].artifact).toBe('slf4j-api');
		expect(dependencies[0].version).toBe('1.7.7');

		expect(dependencies[1].artifact).toBe('slf4j-simple');
		expect(dependencies[1].version).toBe('1.7.7');
	});

	test('error_single_line', () => {
		const gradleSample = `
libraries.junitJupiterApi = "org.junit.jupiter:junit-jupiter-api:4.4.0"
`;

		const dependencies = parser.parseDependency(gradleSample)[0].dependencies;
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
		const dependencies = parser.parseDependency(gradleSample)[0].dependencies;

		expect(dependencies.length).toBe(7);
		expect(dependencies[0].name).toBe('libs.kotlin.stdlib');
	});

	test('sub_projects', () => {
		const gradleSample = `
subprojects {
    dependencies {
        implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
        implementation 'org.springframework.boot:spring-boot-starter-data-redis'
        implementation 'org.springframework.boot:spring-boot-starter-web'
        implementation 'org.springframework.boot:spring-boot-starter-validation'
        implementation 'org.flywaydb:flyway-core'
        implementation "org.springframework.boot:spring-boot-starter-data-redis"
        implementation 'org.apache.commons:commons-lang3:3.0'
        implementation 'org.springframework.security:spring-security-core:5.4.6'
        implementation 'mysql:mysql-connector-java'

        compileOnly 'org.projectlombok:lombok'
        developmentOnly 'org.springframework.boot:spring-boot-devtools'
        annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
        annotationProcessor 'org.projectlombok:lombok'
        testImplementation 'org.springframework.boot:spring-boot-starter-test'
        testImplementation 'com.tngtech.archunit:archunit:0.23.1'
        testImplementation "ch.vorburger.mariaDB4j:mariaDB4j:2.4.0"
        testImplementation 'io.rest-assured:rest-assured:3.0.5'
        testImplementation 'org.dbunit:dbunit:2.7.0'
    }
}
`;
		const dependencies = parser.parseDependency(gradleSample)[0].dependencies;

		expect(dependencies.length).toBe(18);
		dependencies.sort((a, b) => a.name.localeCompare(b.name));

		expect(dependencies[0].name).toBe('ch.vorburger.mariaDB4j:mariaDB4j');
	});
});
