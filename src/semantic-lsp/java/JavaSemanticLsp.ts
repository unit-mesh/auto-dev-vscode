import { LanguageClient } from "vscode-languageclient/node";
import { AutoDevExtension } from "../../auto-dev-extension";
import { extensions } from "vscode";
import { SemanticLsp } from "../SemanticLsp";

export class JavaSemanticLsp extends SemanticLsp {
  context: AutoDevExtension;
  constructor(context: AutoDevExtension) {
    super();
    this.context = context;
  }

  async isActive(): Promise<boolean> {
    let java = extensions.getExtension("redhat.java");
    await java?.activate();
    return java?.isActive || false;
  }

  async getLanguageClient(): Promise<LanguageClient | undefined> {
    let java = extensions.getExtension("redhat.java");
    await java?.activate();
    if (java?.isActive !== true) {
      return undefined;
    }

    console.log(java);
    // todo: spike integration with java language server;
    return java.exports;
  }

  makeRequest(method: string, param: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
