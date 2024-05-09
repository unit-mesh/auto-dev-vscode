import { injectable } from "inversify";
import { Language } from "web-tree-sitter";

import { CodeFile } from "../../editor/codemodel/CodeElement";
import { BaseStructurerProvider } from "../_base/StructurerProvider";
import { LanguageProfile, LanguageProfileUtil } from "../_base/LanguageProfile";

@injectable()
export class TypeScriptStructurer extends BaseStructurerProvider {
	protected langId: string = "typescript";
	protected config: LanguageProfile = LanguageProfileUtil.from(this.langId)!!;
	protected parser: import("web-tree-sitter") | undefined;
	protected language: Language | undefined;

	isApplicable(lang: string) {
		return false;
		// return lang === "typescript" || lang === "javascript" || lang === "typescriptreact" || lang === "javascriptreact";
	}

	parseFile(code: string, path: string): Promise<CodeFile | undefined> {
		throw new Error("Method not implemented.");
	}
}
