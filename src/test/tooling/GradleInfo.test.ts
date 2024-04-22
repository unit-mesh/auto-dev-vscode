import { parseGradleVersionInfo } from '../../lang-eco-context/buildtool/gradle/GradleVersionInfo';

describe('parseGradleInfo', () => {
  it('should parse gradle info correctly', () => {
    const gradleInfoString = `
---------------------------------------------------------
Gradle 8.3
---------------------------------------------------------

Build time:   2023-08-17 07:06:47 UTC
Revision:     8afbf24b469158b714b36e84c6f4d4976c86fcd5

Kotlin:       1.9.0
Groovy:       3.0.17
Ant:          Apache Ant(TM) version 1.10.13 compiled on January 4 2023
JVM:          21.0.2 (Homebrew 21.0.2)
OS:           Mac OS X 14.4.1 x86_64
    `;

    const expectedGradleInfo = {
      gradleVersion: '8.3',
      buildTime: '2023-08-17 07:06:47 UTC',
      revision: '8afbf24b469158b714b36e84c6f4d4976c86fcd5',
      kotlinVersion: '1.9.0',
      groovyVersion: '3.0.17',
      antVersion: 'Apache Ant(TM) version 1.10.13 compiled on January 4 2023',
      jvmVersion: '21.0.2 (Homebrew 21.0.2)',
      os: 'Mac OS X 14.4.1 x86_64',
    };

    const actualGradleInfo = parseGradleVersionInfo(gradleInfoString);

    expect(actualGradleInfo).to.deep.equal(expectedGradleInfo);
  });
});

