import { TSLanguageService } from "./TSLanguageService";
const Parser = require("web-tree-sitter");
import path from "path";

export class TestLanguageService implements TSLanguageService {
	// @ts-ignore
	async getLanguage(langId: string): Promise<Parser.Language | undefined> {
		// node_modules path
		const nodeModulesPath = path.join(__dirname, "..", "..", "node_modules");
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
