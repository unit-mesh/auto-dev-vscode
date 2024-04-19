export class TechStack {
	coreFrameworks: Map<string, boolean>;
	testFrameworks: Map<string, boolean>;
	deps: Map<string, string>;
	devDeps: Map<string, string>;

	constructor(
		coreFrameworks: Map<string, boolean> = new Map(),
		testFrameworks: Map<string, boolean> = new Map(),
		deps: Map<string, string> = new Map(),
		devDeps: Map<string, string> = new Map()
	) {
		this.coreFrameworks = coreFrameworks;
		this.testFrameworks = testFrameworks;
		this.deps = deps;
		this.devDeps = devDeps;
	}

	coreFrameworksList(): string {
		return Array.from(this.coreFrameworks.keys()).join(", ");
	}

	testFrameworksList(): string {
		return Array.from(this.testFrameworks.keys()).join(", ");
	}
}