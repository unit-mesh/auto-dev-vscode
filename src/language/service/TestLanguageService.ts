import path from "path";
import Parser from "web-tree-sitter";

import { TSLanguageService } from "./TSLanguageService";
import { ROOT_DIR } from "../../test/TestUtil";

export class TestLanguageService implements TSLanguageService {
	async getLanguage(langId: string): Promise<Parser.Language | undefined> {
		const nodeModulesPath = path.join(ROOT_DIR, "node_modules");
		const wasmPath = path.join(
			nodeModulesPath,
			"@unit-mesh",
			"treesitter-artifacts",
			"wasm",
			`tree-sitter-${langId}.wasm`
		);

		return await Parser.Language.load(wasmPath);
	}
}
