import { LanguageClient } from "vscode-languageclient/node";

export class SemanticLsp {
  async isActive(): Promise<boolean> {
    return false;
  }

  async getLanguageClient(): Promise<LanguageClient | undefined> {
    return undefined;
  }

  async makeRequest(method: string, param: any): Promise<any> {}
}
