/**
 * Parse the version info from `go version` command.
 * @param stdout  e.g. `go version go1.21.1 darwin/amd64`
 * @returns the version of the Go tooling, e.g. `1.21.1`
 */
export function goVersionParser(stdout: string) {
	const versionRegex = /go version go(\d+\.\d+\.\d+)/;
	const match = versionRegex.exec(stdout);
	if (match) {
		return match[1];
	}
	return "";
}
