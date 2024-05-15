export const EXT_LANGUAGE_MAP: { [key: string]: string } = {
	cpp: "cpp",
	hpp: "cpp",
	cc: "cpp",
	cxx: "cpp",
	hxx: "cpp",
	cp: "cpp",
	hh: "cpp",
	inc: "cpp",
	// Depended on this PR: https://github.com/tree-sitter/tree-sitter-cpp/pull/173
	// ccm: "cpp",
	// c++m: "cpp",
	// cppm: "cpp",
	// cxxm: "cpp",
	cs: "c_sharp",
	c: "c",
	h: "c",
	ts: "typescript",
	mts: "typescript",
	cts: "typescript",
	js: "javascript",
	jsx: "javascript",
	tsx: "typescriptreact",
	mjs: "javascript",
	cjs: "javascript",
	py: "python",
	pyw: "python",
	pyi: "python",
	go: "go",
	java: "java",
	rs: "rust",
	kt: "kotlin",
};

export function languageFromPath(filepath: string) {
	const extension = filepath.split(".").pop() || "";
	return EXT_LANGUAGE_MAP[extension];
}
