import * as vscode from "vscode";

export class AutoDevWebviewProtocol {
  // pub /sub pattern
  private _messageQueue: Array<any> = [];
  private _onMessage = new vscode.EventEmitter<any>();
  _webview: vscode.Webview;
  _webviewListener?: vscode.Disposable;

  get onMessage() {
    return this._onMessage.event;
  }

  constructor(private readonly webview: vscode.Webview) {
    this._webview = webview;
  }

  request(messageType: string, data: { prompt: string }) {
    throw new Error("Method not implemented.");
  }
}
