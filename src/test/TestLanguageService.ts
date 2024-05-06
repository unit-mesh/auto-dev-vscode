import path from "path";
import fs from "fs";
import { Language } from "web-tree-sitter";
// In the test, we need to import Parser from "web-tree-sitter" as a const.
const Parser = require("web-tree-sitter");

import { TSLanguageService } from "../editor/language/service/TSLanguageService";
import { ROOT_DIR } from "./TestUtil";

/**
 * TestOnly: Language service for tree-sitter languages, used in test code.
 */
export class TestLanguageService extends TSLanguageService {
	_parser: any;

	constructor(parser: any) {
		super();
		this._parser = parser;
	}

	async getLanguage(langId: string): Promise<Language | undefined> {
		const nodeModulesPath = path.join(ROOT_DIR, "node_modules");
		const wasmPath = path.join(
			nodeModulesPath,
			"@unit-mesh",
			"treesitter-artifacts",
			"wasm",
			`tree-sitter-${langId}.wasm`
		);

		const bits = fs.readFileSync(wasmPath);
		await Parser.init();
		return await Parser.Language.load(bits);
	}

	getParser(): any {
		return this._parser;
	}
}
