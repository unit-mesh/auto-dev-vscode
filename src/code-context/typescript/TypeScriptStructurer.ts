import { injectable } from "inversify";

import { CodeFile } from "../../editor/codemodel/CodeFile";
import { StructurerProvider } from "../_base/StructurerProvider";

@injectable()
export class TypeScriptStructurer implements StructurerProvider {
	isApplicable(lang: string) {
		return false;
		// return lang === "typescript" || lang === "javascript" || lang === "typescriptreact" || lang === "javascriptreact";
	}

	parseFile(code: string, path: string): Promise<CodeFile | undefined> {
		throw new Error("Method not implemented.");
	}
}