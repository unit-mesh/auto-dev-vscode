import * as vscode from "vscode";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "./language/SupportedLangauge.ts";
import { parse } from './language/TreeSitterParser.ts';
import { AutoDevExtension } from "./auto-dev-extension";

class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
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

      try {
        const parsed = await parse(
          this.context.extensionContext.extensionUri,
          langid,
          document.getText()
        );
        console.log(parsed);
      } catch (e) {
        console.log(e);
      }
      throw new Error("Method not implemented.");
    })();
  }
  resolveCodeLens?(
    codeLens: vscode.CodeLens,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens> {
    throw new Error("Method not implemented.");
  }
}

export function registerCodeLens(context: AutoDevExtension) {
    const filter = SUPPORTED_LANGUAGES.map(it => ({language: it} as vscode.DocumentFilter));
    const codelensProviderSub = vscode.languages.registerCodeLensProvider(
        filter,
        new AutoDevCodeLensProvider(context),
    );

    context.extensionContext.subscriptions.push(codelensProviderSub);
}
