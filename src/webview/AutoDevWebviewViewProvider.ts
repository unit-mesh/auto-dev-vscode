import * as vscode from "vscode";
import { AutoDevWebviewProtocol } from "./AutoDevWebviewProtocol";


export class AutoDevWebviewViewProvider implements vscode.WebviewViewProvider {
	private _webview?: vscode.Webview;
	public webviewProtocol: AutoDevWebviewProtocol = new AutoDevWebviewProtocol(this._webview!);

	get webview() {
		return this._webview;
	}

	public static readonly viewType = "autodev.autodevGUIView";
	resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext<unknown>,
		token: vscode.CancellationToken
	): void | Thenable<void> {
		this._webview = webviewView.webview;
		webviewView.webview.html = this.getSidebarContent(webviewView);
	}

	getSidebarContent(webviewView: vscode.WebviewView): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello, World!</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
`;
	}
}
