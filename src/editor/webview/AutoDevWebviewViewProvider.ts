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
  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext<unknown>,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this._webview = webviewView.webview;
    this.webviewProtocol = new AutoDevWebviewProtocol(this._webview);

    webviewView.webview.html = await this.getSidebarContent(webviewView);
  }

  async getSidebarContent(panel: vscode.WebviewPanel | vscode.WebviewView): Promise<string> {
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

        // for dev HMR
        {
          webviewPort: 18999,
          extensionHostPort: 18999,
        }
      ],
    };
    const webview = panel.webview;
    const inDevelopmentMode =
      this._context?.extensionMode === vscode.ExtensionMode.Development;

    if (inDevelopmentMode) {
      const nodeFetch = await import("node-fetch").then((x) => x.default);

      const csp = [
        `default-src 'none';`,
        `script-src 'unsafe-eval' https://* http://127.0.0.1 http://0.0.0.0:${18999}`,
        `style-src ${webview.cspSource} 'self' 'unsafe-inline' https://*`,
        `font-src ${webview.cspSource}`,
        `connect-src https://*  ws://127.0.0.1 ws://0.0.0.0:18999 http:/127.0.0.1 http://0.0.0.0:18999`,
      ]

      let x = await nodeFetch("http://localhost:18999/index.html").then(r => r.text());
      try {
        // scripts
        x = x.replace(/<script.*?src="(.*)"/gm, (_, g1) => `<script type="module" src="http://127.0.0.1:18999${g1}"`)
        // styles
        x = x.replace(/<link rel="stylesheet" href="(.*?)"/gm, (_, g1) => `<link rel="stylesheet" href="http://127.0.0.1:18999${g1}"`)
        // csp rules
        x = x.replace("<!-- {csp-placeholder} -->", `<meta http-equiv="Content-Security-Policy" content="${csp.join(" ")}">`)
      } catch(e) {
        console.error(e)
      }
      console.log(x)
      return x;
    }

    console.log("Loading from dist folder...")

    return ""
  }
}
