import { LanguageClient } from "vscode-languageclient/node";
import { AutoDevContext } from "../../autodev-context";
import { /**DocumentSymbol, SymbolInformation, */ extensions } from "vscode";
import { SemanticLsp } from "../SemanticLsp";

// type DocumentSymbolsResponse = DocumentSymbol[] | SymbolInformation[] | null;

export class JavaSemanticLsp extends SemanticLsp {
  context: AutoDevContext;
  constructor(context: AutoDevContext) {
    super();
    this.context = context;
  }

  isActive(): boolean {
    let java = extensions.getExtension("redhat.java");
    if (!java?.activate()) {
      return false;
    }

    return true;
  }

  async getLanguageClient(): Promise<LanguageClient | undefined> {
    let java = extensions.getExtension("redhat.java");
    if (!java?.activate()) {
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
