import { SupportedLanguage } from "../language/supported";
import { LanguageClient } from "vscode-languageclient/node";

export class SemanticLsp {
  isActive(): boolean {
    return true;
  }
  async getLanguageClient(): Promise<LanguageClient | undefined> {
    return undefined;
  }

  async makeRequest(method: string, param: any): Promise<any> {}
}
