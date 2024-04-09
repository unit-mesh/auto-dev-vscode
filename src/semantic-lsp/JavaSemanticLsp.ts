import { LanguageClient } from "vscode-languageclient/node";
import { AutoDevContext } from "../autodev-context";
import { extensions } from "vscode";
import { SemanticLsp } from './SemanticLsp';

export class JavaSemanticLsp implements SemanticLsp {
    context: AutoDevContext;
    constructor(context: AutoDevContext) {
        this.context = context;
    }

    isActive() {
        return true;
    }

    startClient(language: String) : LanguageClient | undefined {
        let java = extensions.getExtension("redhat.java");
        if (!java) {
            return undefined;
        }

        // todo: spike integration with java language server;
    }

    makeRequest(method: string, param: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
