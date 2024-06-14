import { Uri, type Webview } from 'vscode';

export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function getWebviewContent(webview: Webview, scriptsUri: Uri, stylesUri: Uri): string {
	const nonce = getNonce();
	// <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src ${webview.cspSource}; font-src data:; img-src 'self' data: https:;">

	return `<!DOCTYPE html>
	<html>
	<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" nonce="${nonce}" href="${stylesUri}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" nonce="${nonce}" src="${scriptsUri}"></script>
    </body>
  </html>`;
}
