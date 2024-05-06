export interface GradleVersionInfo {
	gradleVersion?: string;
	buildTime: string;
	revision: string;
	kotlinVersion: string;
	groovyVersion: string;
	antVersion: string;
	jvmVersion: string;
	os: string;
}

/**
 *
 * Parses the Gradle info string and returns a GradleInfo object.
 *
 * ```
 * ------------------------------------------------------------
 * Gradle 8.3
 * ------------------------------------------------------------
 *
 * Build time:   2023-08-17 07:06:47 UTC
 * Revision:     8afbf24b469158b714b36e84c6f4d4976c86fcd5
 *
 * Kotlin:       1.9.0
 * Groovy:       3.0.17
 * Ant:          Apache Ant(TM) version 1.10.13 compiled on January 4 2023
 * JVM:          21.0.2 (Homebrew 21.0.2)
 * OS:           Mac OS X 14.4.1 x86_64
 * ```
 */
export function parseGradleVersionInfo(info: string): GradleVersionInfo {
	const gradleInfo: GradleVersionInfo = {
		gradleVersion: "",
		buildTime: "",
		revision: "",
		kotlinVersion: "",
		groovyVersion: "",
		antVersion: "",
		jvmVersion: "",
		os: ""
	};

	const regex = /([A-Za-z\s]+):\s+(.+)/;
	const gradleVersionRegex = /Gradle\s+(\d+\.\d+)/;

	info.split('\n').forEach(line => {
		let gradleMatch = line.match(gradleVersionRegex);
		if (gradleMatch) {
			const [, version] = gradleMatch;
			gradleInfo.gradleVersion = version;
		}

		const match = line.match(regex);
		if (match) {
			const [, key, value] = match;
			switch (key) {
				case "Build time":
					gradleInfo.buildTime = value;
					break;
				case "Revision":
					gradleInfo.revision = value;
					break;
				case "Kotlin":
					gradleInfo.kotlinVersion = value;
					break;
				case "Groovy":
					gradleInfo.groovyVersion = value;
					break;
				case "Ant":
					gradleInfo.antVersion = value;
					break;
				case "JVM":
					gradleInfo.jvmVersion = value;
					break;
				case "OS":
					gradleInfo.os = value;
					break;
				default:
					break;
			}
		}
	});

	return gradleInfo;
}
