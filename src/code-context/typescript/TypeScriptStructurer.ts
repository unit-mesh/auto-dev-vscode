import { injectable } from "inversify";

import { CodeFile } from "../../editor/codemodel/CodeFile";
import { Structurer } from "../_base/BaseStructurer";

@injectable()
export class TypeScriptStructurer implements Structurer {
    parseFile(code: string, path: string): Promise<CodeFile | undefined> {
        throw new Error("Method not implemented.");
    }

}