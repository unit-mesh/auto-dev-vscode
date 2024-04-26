import * as vscode from "vscode";

import { getExtensionUri } from "../../context";
import { callAI, getChatModelList } from "./LLMTools";
import { channel } from "../../channel";
import { uuid } from "./uuid";

type WebviewEvent = {
  id: string;
  type: string;
  data: any;
  reply: (messageType: string, data: object) => void;
};

export class AutoDevWebviewProtocol {
  private _onMessage = new vscode.EventEmitter<any>();
  _webview: vscode.Webview;
  _webviewListener?: vscode.Disposable;

  get onMessage() {
    return this._onMessage.event;
  }

  listeners = new Map<keyof WebviewProtocol, ((message: Message) => any)[]>();
  abortedMessageIds: Set<string> = new Set();

  on<T extends keyof WebviewProtocol>(
    messageType: T,
    handler: (
      message: Message<WebviewProtocol[T][0]>,
    ) => Promise<WebviewProtocol[T][1]> | WebviewProtocol[T][1],
  ): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)?.push(handler);
  }

  get webview(): vscode.Webview | undefined {
    return this._webview;
  }

  set webview(webView: vscode.Webview) {
    this._webview = webView;
    this._webviewListener?.dispose();

    this._webviewListener = this._webview.onDidReceiveMessage(async (msg) => {
      if (!msg.messageType || !msg.messageId) {
        throw new Error("Invalid webview protocol msg: " + JSON.stringify(msg));
      }

      const respond = (message: any) =>
        this.send(msg.messageType, message, msg.messageId);

      const handlers = this.listeners.get(msg.messageType) || [];
      for (const handler of handlers) {
        try {
          const response = await handler(msg);
          if (
            response &&
            typeof response[Symbol.asyncIterator] === "function"
          ) {
            let next = await response.next();
            while (!next.done) {
              respond(next.value);
              next = await response.next();
            }
            respond({ done: true, content: next.value?.content });
          } else {
            respond(response || {});
          }
        } catch (e: any) {
          console.error(
            "Error handling webview message: " +
            JSON.stringify({ msg }, null, 2),
          );

          let message = e.message;
          if (e.cause) {
            if (e.cause.name === "ConnectTimeoutError") {
              message = `Connection timed out. If you expect it to take a long time to connect, you can increase the timeout in config.json by setting "requestOptions": { "timeout": 10000 }. You can find the full config reference here: https://continue.dev/docs/reference/config`;
            } else if (e.cause.code === "ECONNREFUSED") {
              message = `Connection was refused. This likely means that there is no server running at the specified URL. If you are running your own server you may need to set the "apiBase" parameter in config.json. For example, you can set up an OpenAI-compatible server like here: https://continue.dev/docs/reference/Model%20Providers/openai#openai-compatible-servers--apis`;
            } else {
              message = `The request failed with "${e.cause.name}": ${e.cause.message}. If you're having trouble setting up Continue, please see the troubleshooting guide for help.`;
            }
          }

          vscode.window
            .showErrorMessage(message, "Show Logs", "Troubleshooting")
            .then((selection) => {
              if (selection === "Show Logs") {
                vscode.commands.executeCommand(
                  "workbench.action.toggleDevTools",
                );
              } else if (selection === "Troubleshooting") {
                vscode.env.openExternal(
                  vscode.Uri.parse("https://continue.dev/docs/troubleshooting"),
                );
              }
            });
        }
      }
    });
  }

  constructor(webview: vscode.Webview) {
    this._webview = webview;

    webview.onDidReceiveMessage((message) => {
      const messageId = message && message.messageId;
      const messageType = message && message.messageType;
      if (!(messageId || messageType)) {
        return;
      }

      channel.appendLine(`Received message: ${messageType}`);

      const reply = (messageType: string, data: unknown) => {
        this._webview.postMessage({
          messageId: messageId,
          messageType: messageType,
          data: JSON.stringify(data),
        });
      };

      switch (messageType) {
        case "getOpenFiles":
          let files = this.getOpenFiles();
          this.send("getOpenFiles", files, messageId);
          break;
        case "onLoad":
          this.onLoad({
            id: messageId,
            type: messageType,
            data: message.data,
            reply,
          });
          break;
        case "config/getBrowserSerialized":
          this.getBrowserSerialized({
            id: messageId,
            type: messageType,
            data: message.data,
            reply,
          });
          break;
        // case "history/save"
        case "llm/streamChat":
          this.streamChat({
            id: messageId,
            type: messageType,
            data: message.data,
            reply,
          });
          break;
        default:
          console.log("unknown message type: %s", messageType);
      }
    });
  }

  onLoad({ type, reply }: WebviewEvent) {
    reply(type, {
      windowId: "1",
      serverUrl: "",
      workspacePaths: [],
      vscMachineId: "1111",
      vscMediaUrl: getExtensionUri().toString(),
    });
  }

  private documentIsCode(document: vscode.TextDocument) {
    return document.uri.scheme === "file";
  }

  getOpenFiles() {
    return vscode.workspace.textDocuments
      .filter((document) => this.documentIsCode(document))
      .map((document) => {
        return document.uri.fsPath;
      });
  }

  // See continue BrowserSerializedContinueConfig
  getBrowserSerialized({ reply, type }: WebviewEvent) {
    reply(type,{
      models: getChatModelList(),
      // contextProviders: [],
      // disableIndexing: false,
      // disableSessionTitles: false,
      allowAnonymousTelemetry: false,
    });
  }

  async streamChat({ data, reply, type }: WebviewEvent) {
    console.log("streamChat", JSON.stringify(data));

    try {
      const completion = await callAI(data);

      if (!completion) {
        reply(type, { content: "暂不支持此模型的使用" });
        reply(type, { done: true });
        return;
      }

      for await (const chunk of completion) {
        reply(type, {
          content: chunk.content,
        });
      }
    } catch (err) {
      reply(type, {
        content: `Error: ${(err as Error).message}`,
      });
    } finally {
      reply(type, {
        done: true,
      });
    }
  }

  private send(messageType: string, data: any, messageId?: string): string {
    channel.appendLine(`Sending message: ${messageType}`);
    const id = messageId ?? uuid();
    this._webview?.postMessage({
      messageType,
      data,
      messageId: id,
    });
    return id;
  }

  request(messageType: string, data: any) {
    const messageId = uuid();
    return new Promise((resolve) => {
      if (!this._webview) {
        resolve(undefined);
        return;
      }

      this.send(messageType, data, messageId);
      const disposable = this._webview.onDidReceiveMessage(
        (msg: Message<any>) => {
          if (msg.messageId === messageId) {
            resolve(msg.data);
            disposable?.dispose();
          }
        },
      );
    });
  }
}

export interface Message<T = any> {
  messageType: string;
  messageId: string;
  data: T;
}

export type WebviewProtocol = {
  newSessionWithPrompt: [{ prompt: string }, void];
  getTerminalContents: [undefined, string];
};
