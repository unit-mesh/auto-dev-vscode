import { DEP_SCOPE, DependencyEntry, PackageDependencies } from "../_base/Dependence";
import { DependencyInspector } from "../_base/DependencyInspector";
import { PackageManger } from "../_base/PackageManger";

// implementation "joda-time:joda-time:2.2"
const GRADLE_SHORT_IMPL_REGEX = /([a-zA-Z]+)?(?:\(|\s)\s*['"](([^\s,@'":\/\\]+):([^\s,@'":\/\\]+):([^\s,'":\/\\]+))['"]/g;

// implementation "joda-time:joda-time"
const SHORT_IMPL_REGEX_NO_VERSION = /([a-zA-Z]+)?(?:\(|\s)\s*['"](([^\s,@'":\/\\]+):([^\s,@'":\/\\]+))['"]/g;

// gradle version catalog
// implementation(libs.bundles.openai)
const GRADLE_VERSION_CATALOG_REGEX = /([a-zA-Z]+)(?:\(|\s)(([a-zA-Z]+)((\.[a-zA-Z]+)+))/g;

// runtimeOnly(group = "org.springframework", name = "spring-core", version = "2.5")
const GRADLE_KEYWORD_REGEX = /\s+([a-zA-Z]+)(?:^|\s|,|\()((([a-zA-Z]+)(\s*=|:)\s*['"]([^'"]+)['"][\s,]*)+)\)/;

// sample: dependencySet(group:'org.slf4j', version: '1.7.7') { entry 'slf4j-api' }
const DEPENDENCY_SET_START_REGEX = /(?:^|\s)dependencySet\(([^)]+)\)\s*{/;

//     entry 'slf4j-api'
const ENTRY_REGEX = /\s+entry\s+['"]([^\s,@'":\/]+)['"]/;

export class GradleDependencyInspector implements DependencyInspector {
	versionCatalogs: { [key: string]: DependencyEntry; } = {};

	constructor() {
		this.versionCatalogs = {};
	}

	parseDependency(content: string): PackageDependencies[] {
		const deps = [];
		deps.push(...this.parseShortForm(content));
		deps.push(...this.parseKeywordArg(content));
		deps.push(...this.parseDependencySet(content));
		deps.push(...this.parseVersionCatalog(content));

		return [{
			name: "",
			version: "",
			packageManager: PackageManger.GRADLE,
			dependencies: deps,
			path: ""
		}];
	}

	substringAfter(str: string, substr: string) {
		var index = str.indexOf(substr);
		if (index === -1) {
			return ""; // 如果子串不存在，则返回空字符串
		}
		return str.substring(index + substr.length);
	}

	parseVersionCatalog(content: string) {
		const versionsDep = [];
		const findAll = content.matchAll(GRADLE_VERSION_CATALOG_REGEX);

		for (const match of findAll) {
			if (match.length >= 4) {
				try {
					const group = match[2];
					const matchGroup = this.substringAfter(group, "libs.").replace(".", "-");

					if (matchGroup === "") {
						continue;
					}

					const dependencyEntry = this.versionCatalogs[matchGroup];
					if (dependencyEntry) {
						versionsDep.push(dependencyEntry);
					} else {
						versionsDep.push({
							name: match[2],
							group: "",
							artifact: match[2],
							version: "",
							scope: this.scopeForGradle(match[1])
						});
					}
				} catch (e) {
					// Ignore and continue
				}
			}
		}

		return versionsDep;
	}

	// sample: implementation "joda-time:joda-time:2.2"
	parseShortForm(content: string) {
		const versionsDep = [];
		const noVersionDeps = [];

		let match;
		while ((match = GRADLE_SHORT_IMPL_REGEX.exec(content)) !== null) {
			if (match.length === 6) {
				try {
					const [, scope, , group, artifact, version] = match;
					const scopeValue = this.scopeForGradle(scope);
					versionsDep.push({
						name: `${group}:${artifact || ''}`,
						group: group || '',
						artifact: artifact || '',
						version: version || '',
						scope: scopeValue
					});
				} catch (e) {
					// Ignore and continue
				}
			}
		}

		while ((match = SHORT_IMPL_REGEX_NO_VERSION.exec(content)) !== null) {
			if (match.length === 5) {
				try {
					const [, scope, , group, artifact] = match;
					const scopeValue = this.scopeForGradle(scope);
					noVersionDeps.push({
						name: `${group}:${artifact}`,
						group: group || '',
						artifact: artifact || '',
						version: '',
						scope: scopeValue
					});
				} catch (e) {
					// Ignore and continue
				}
			}
		}

		return versionsDep.concat(noVersionDeps);
	}

	private scopeForGradle(content: string): DEP_SCOPE {
		if (content.startsWith("test")) {
			return DEP_SCOPE.TEST;
		}

		if (content.startsWith("runtime")) {
			return DEP_SCOPE.RUNTIME;
		}

		return DEP_SCOPE.NORMAL;
	}

	// sample: runtimeOnly(group = "org.springframework", name = "spring-core", version = "2.5")
	parseKeywordArg(content: string) {
		const dependencyEntries = [];

		for (const line of content.split('\n')) {
			const match = line.match(GRADLE_KEYWORD_REGEX);
			if (match && match.length > 6) {
				const scope = this.scopeForGradle(match[1]);
				const group = this.valueFromRegex("group", line);
				const artifact = this.valueFromRegex("name", line);
				const version = this.valueFromRegex("version", line);

				dependencyEntries.push({
					name: `${group}:${artifact}`,
					group: group,
					artifact: artifact,
					version: version,
					scope: scope
				});
			}
		}

		return dependencyEntries;
	}

	// case 1: `name = 'joda-time'`
	// case 2: `name: 'joda-time'`
	valueFromRegex(key: string, text: string) {
		const keyRegex = new RegExp(`(${key}(\\s*=|:)\\s*['"]([^'"]+)['"])`);
		const matchResult = keyRegex.exec(text);
		if (matchResult !== null) {
			return matchResult[3];
		}

		return "";
	}


	// sample: dependencySet(group:'org.slf4j', version: '1.7.7') { entry 'slf4j-api' }
	parseDependencySet(content: string) {
		const deps = [];
		const lines = content.split('\n');

		for (let i = 0; i < lines.length; i++) {
			const text = lines[i];
			const depSetResult = text.match(DEPENDENCY_SET_START_REGEX);
			if (depSetResult && depSetResult.length === 2) {
				const entries = [];
				const entry = depSetResult[1];

				const group = this.valueFromRegex("group", entry);
				const version = this.valueFromRegex("version", entry);

				while (i < lines.length) {
					const next = lines[i];
					if (next.includes("}")) {
						break;
					} else {
						entries.push(next);
					}
					i++;
				}

				for (const entry of entries) {
					const find = entry.match(ENTRY_REGEX);
					if (find && find.length === 2) {
						const artifact = find[1];

						deps.push({
							name: `${group}:${artifact}`,
							artifact: artifact,
							group: group,
							version: version
						});
					}
				}
			}
		}

		return deps;
	}
}
