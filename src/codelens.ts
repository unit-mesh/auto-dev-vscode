import * as vscode from 'vscode'
import type { SupportedLangId } from './supported'
import { SUPPORTED_LANGID } from './supported'
import { parse } from './parser'

class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
  onDidChangeCodeLenses?: vscode.Event<void> | undefined
  provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
    return (async () => {
      const langid = document.languageId as SupportedLangId
      if (!SUPPORTED_LANGID.includes(langid))
        return []

      try {
        const parsed = await parse(langid, document.getText())
        // eslint-disable-next-line no-console
        console.log(parsed)
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
      throw new Error('Method not implemented.')
    })()
  }

  resolveCodeLens?(_codeLens: vscode.CodeLens, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
    throw new Error('Method not implemented.')
  }
}

export function install(context: vscode.ExtensionContext) {
  const filter = SUPPORTED_LANGID.map(it => ({ language: it } as vscode.DocumentFilter))
  const codelensProviderSub = vscode.languages.registerCodeLensProvider(
    filter,
    new AutoDevCodeLensProvider(),
  )

  context.subscriptions.push(codelensProviderSub)
  // eslint-disable-next-line no-console
  console.log('codelens provider installed.')
}
