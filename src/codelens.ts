import * as vscode from 'vscode';
import { SUPPORTED_LANGID, SupportedLangId } from "./supported";
import { parse } from './parser';

class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void> | undefined;
    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        const langid = document.languageId as SupportedLangId;
        if (!SUPPORTED_LANGID.includes(langid)) {
            return [];
        }

        const parsed = parse(langid, document.getText());
        console.log(parsed);  
    
        throw new Error('Method not implemented.');
    }
    resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        throw new Error('Method not implemented.');
    }
}

export function install(context: vscode.ExtensionContext) {
    const filter = SUPPORTED_LANGID.map(it => ({language: it} as vscode.DocumentFilter))
    const codelensProviderSub = vscode.languages.registerCodeLensProvider(
        filter,
        new AutoDevCodeLensProvider(),
    );

    context.subscriptions.push(codelensProviderSub);
    console.log("codelens provider installed.")
}