import * as vscode from "vscode";
import { AutoDevWebviewProtocol } from "./AutoDevWebviewProtocol";

export class AutoDevWebviewViewProvider implements vscode.WebviewViewProvider {
  private _webview?: vscode.Webview;

  public webviewProtocol!: AutoDevWebviewProtocol;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  get webview() {
    return this._webview;
  }

  public static readonly viewType = "autodev.autodevGUIView";
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext<unknown>,
    _token: vscode.CancellationToken
  ): void | Thenable<void> {
    this._webview = webviewView.webview;
    this.webviewProtocol = new AutoDevWebviewProtocol(this._webview);

    webviewView.webview.html = this.getSidebarContent(webviewView);
  }

  getSidebarContent(panel: vscode.WebviewPanel | vscode.WebviewView): string {
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._context.extensionUri, "dist/renderer")
      ],
      enableCommandUris: true,
      portMapping: [
        {
          webviewPort: 65433,
          extensionHostPort: 65433,
        },
      ],
    };

    const jsSrc = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, 'dist/renderer/index-DSMEdJyR.js')
     );

    const cssSrc = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, 'dist/renderer/index-BW36QkLH.css')
     );

    return `
	<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
    <script type="module" crossorigin src="${jsSrc}"></script>
    <link rel="stylesheet" crossorigin href="${cssSrc}">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
	`;
  }
}
