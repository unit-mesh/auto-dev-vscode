import * as vscode from "vscode";
import { getExtensionUri } from "../../context";
import { getNonce, getUniqueId } from "../util/vscode";
import { getTheme } from "../util/getTheme";

import { AutoDevWebviewProtocol } from "./AutoDevWebviewProtocol";

export class AutoDevWebviewViewProvider implements vscode.WebviewViewProvider {
  private _webview?: vscode.Webview;

  public webviewProtocol!: AutoDevWebviewProtocol;

  constructor(
    private readonly _context: vscode.ExtensionContext,
    private readonly windowId: string = ""
  ) {}

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
    this.webviewProtocol = new AutoDevWebviewProtocol(this._webview,);

    webviewView.webview.html = await this.getSidebarContent(
      this._context,
      webviewView
    );
  }

  async getSidebarContent(
    context: vscode.ExtensionContext | undefined,
    panel: vscode.WebviewPanel | vscode.WebviewView,
    page: string | undefined = undefined,
    edits: any[] | undefined = undefined,
    isFullScreen: boolean = false
  ): Promise<string> {
    let extensionUri = getExtensionUri()!;
    let scriptUri: string;
    let styleMainUri: string;
    let vscMediaUrl: string = panel.webview
      .asWebviewUri(vscode.Uri.joinPath(extensionUri, "gui"))
      .toString();

    const inDevelopmentMode =
      context?.extensionMode === vscode.ExtensionMode.Development;
    // if (!inDevelopmentMode) {
    scriptUri = panel.webview
      .asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "gui-sidebar/dist/assets/index.js")
      )
      .toString();
    styleMainUri = panel.webview
      .asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "gui-sidebar/dist/assets/index.css")
      )
      .toString();
    // } else {
    //   scriptUri = "http://localhost:5173/src/main.tsx";
    //   styleMainUri = "http://localhost:5173/src/index.css";
    // }

    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, "gui-sidebar"),
        vscode.Uri.joinPath(extensionUri, "dist", "assets"),
      ],
      enableCommandUris: true,
      portMapping: [
        {
          webviewPort: 65433,
          extensionHostPort: 65433,
        },
      ],
    };

    const nonce = getNonce();

    const currentTheme = getTheme();
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.colorTheme")) {
        // Send new theme to GUI to update embedded Monaco themes
        this.webviewProtocol?.request("setTheme", { theme: getTheme() });
      }
    });

    this.webviewProtocol._webview = panel.webview;

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>const vscode = acquireVsCodeApi();</script>
        <link href="${styleMainUri}" rel="stylesheet">

        <title>Continue</title>
      </head>
      <body>
        <div id="root"></div>

        ${
          inDevelopmentMode
            ? `<script type="module">
          import RefreshRuntime from "http://localhost:5173/@react-refresh"
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true
          </script>`
            : ""
        }

        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>

        <script>localStorage.setItem("ide", "vscode")</script>
        <script>window.windowId = "${this.windowId}"</script>
        <script>window.vscMachineId = "${getUniqueId()}"</script>
        <script>window.vscMediaUrl = "${vscMediaUrl}"</script>
        <script>window.ide = "vscode"</script>
        <script>window.fullColorTheme = ${JSON.stringify(currentTheme)}</script>
        <script>window.colorThemeName = "dark-plus"</script>
        <script>window.workspacePaths = ${JSON.stringify(
          vscode.workspace.workspaceFolders?.map(
            (folder) => folder.uri.fsPath
          ) || []
        )}</script>
        <script>window.isFullScreen = ${isFullScreen}</script>

        ${edits ? `<script>window.edits = ${JSON.stringify(edits)}</script>` : ""}
        ${page ? `<script>window.location.pathname = "${page}"</script>` : ""}
      </body>
    </html>`;
  }
}
