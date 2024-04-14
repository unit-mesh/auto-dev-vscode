import * as vscode from "vscode";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../language/SupportedLanguage";
import { parse } from '../parser/TreeSitterParser';
import { AutoDevExtension } from "../AutoDevExtension";
import { documentToTreeSitterFile } from "../semantic/TreeSitterFileUtil";
import { TreeSitterFile, TreeSitterFileError } from "../semantic/TreeSitterFile";
import { IdentifierBlockRange } from "../document/IdentifierBlockRange";

export class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
  constructor(private readonly context: AutoDevExtension) {}

  onDidChangeCodeLenses: vscode.Event<void> | undefined;
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    return (async () => {
      const langid = document.languageId as SupportedLanguage;
      if (!SUPPORTED_LANGUAGES.includes(langid)) {
        return [];
      }

      const file = await documentToTreeSitterFile(document);
      if (!(file instanceof TreeSitterFile)) {
        return;
      }

      const methodRanges: IdentifierBlockRange[] | TreeSitterFileError = file.methodRanges();
      let lenses: vscode.CodeLens[] = [];

      if (methodRanges instanceof Array) {
        lenses = this.setupDocIfNoExist(methodRanges, document, langid);
      }

      return lenses;
    })();
  }

  private setupDocIfNoExist(methodRanges: IdentifierBlockRange[], document: vscode.TextDocument, langid: string) {
    return methodRanges.map((result) => {
      const title = `生成注释`;
      const lens = new vscode.CodeLens(result.identifierRange, {
        title,
        command: "autodev.generateDoc",
        arguments: [document, result],
      });
      return lens;
    });
  }
}

