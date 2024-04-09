import { SupportedLanguage } from "../language/supported";
import { LanguageClient } from "vscode-languageclient/node";

export interface SemanticLsp {
  isActive(): boolean;
  startClient(language: String) : LanguageClient | undefined;
  /* async */ makeRequest(method: string, param: any): Promise<any>;
}
