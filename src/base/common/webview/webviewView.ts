import {
	type CancellationToken,
	type ExtensionContext,
	Uri,
	type ViewBadge,
	type Webview,
	type WebviewView,
	type WebviewViewResolveContext,
} from 'vscode';

export abstract class AbstractWebviewViewProvider {
	protected _extensionContext: ExtensionContext;
	protected _extensionUri: Uri;

	protected _webviewView?: WebviewView;
	protected _webviewViewContext?: WebviewViewResolveContext<unknown>;
	protected _webview?: Webview;

	constructor(protected extensionContext: ExtensionContext) {
		this._extensionContext = extensionContext;
		this._extensionUri = extensionContext.extensionUri;
	}

	async resolveWebviewView(
		webviewView: WebviewView,
		webviewContext: WebviewViewResolveContext<unknown>,
		token: CancellationToken,
	): Promise<void> {
		const webview = webviewView.webview;

		this._webviewView = webviewView;
		this._webviewViewContext = webviewContext;
		this._webview = webview;

		await this.provideWebviewView(webviewView, webviewContext, token);
	}

	abstract provideWebviewView(
		webviewView: WebviewView,
		webviewContext: WebviewViewResolveContext<unknown>,
		token: CancellationToken,
	): Promise<void>;

	get title() {
		return this._webviewView?.title;
	}

	set title(title: string | undefined) {
		const webviewView = this._webviewView;
		if (webviewView) {
			webviewView.title = title;
		}
	}

	get badge() {
		return this._webviewView?.badge;
	}

	set badge(badge: ViewBadge | undefined) {
		const webviewView = this._webviewView;
		if (webviewView) {
			webviewView.badge = badge;
		}
	}

	asWebviewUri(...pathList: string[]): Uri {
		const webview = this._webview!;
		const extensionUri = this._extensionUri;

		return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
	}

	async postMessage(message: unknown): Promise<boolean> {
		const webview = this._webview;

		if (webview) {
			return webview.postMessage(message);
		}

		return false;
	}
}
