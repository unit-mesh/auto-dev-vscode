import * as vscode from "vscode";

import { getExtensionContext, getExtensionUri } from "../../context";
import { callAI, getChatModelList } from "../../llm-provider/LLMTools";
import { channel } from "../../channel";
import { SettingService } from "../../settings/SettingService";
import { uuid } from "./uuid";
import { AutoDevCommand } from "../../commands/autoDevCommand";

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

  private config: SettingService;

  get onMessage() {
    return this._onMessage.event;
  }

  listeners = new Map<keyof WebviewProtocol, ((message: Message) => any)[]>();
  abortedMessageIds: Set<string> = new Set();

  on<T extends keyof WebviewProtocol>(
    messageType: T,
    handler: (
      message: Message<WebviewProtocol[T][0]>
    ) => Promise<WebviewProtocol[T][1]> | WebviewProtocol[T][1]
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
        channel.error("(AutoDevWebview): Invalid webview protocol msg: ", msg);
        channel.show();
        return;
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
              JSON.stringify({ msg }, null, 2)
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
                  "workbench.action.toggleDevTools"
                );
              } else if (selection === "Troubleshooting") {
                vscode.env.openExternal(
                  vscode.Uri.parse("https://continue.dev/docs/troubleshooting")
                );
              }
            });
        }
      }
    });
  }

  private _lastChatAbortController?: AbortController;

  constructor(webview: vscode.Webview) {
    this._webview = webview;

    this.config = SettingService.instance();
    this.config.onDidChange(() => {
      this.send("configUpdate");
    });

    webview.onDidReceiveMessage((message) => {
      const messageId = message && message.messageId;
      const messageType = message && message.messageType;
      if (!(messageId || messageType)) {
        return;
      }

      // channel.appendLine(`Received message: ${messageType}`);

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
        case "openConfigJson":
          this.openSettings();
          break;
        case "errorPopup":
          vscode.window
            .showErrorMessage(message.data.message, "Show Logs")
            .then((selection) => {
              if (selection === "Show Logs") {
                vscode.commands.executeCommand(
                  "workbench.action.toggleDevTools"
                );
              }
            });
          break;
        case "onLoad":
          this.onLoad({
            id: messageId,
            type: messageType,
            data: message.data,
            reply,
          });
          break;
        case "showTutorial":
          vscode.commands.executeCommand("autodev.showTutorial");
          break;
        case "config/getBrowserSerialized":
          this.getBrowserSerialized({
            id: messageId,
            type: messageType,
            data: message.data,
            reply,
          });
          break;
        case "history/save":
          // todo: add support;
          break;
        case "abort":
          // TODO abort stream;
          break;
        case "configUpdate":
          // todo: add support;
          break;
        case "newSessionWithPrompt":
          // No need for response.
          break;
        case "llm/streamChat":
          this.streamChat({
            id: messageId,
            type: messageType,
            data: message.data,
            reply,
          });
          break;
        case "context/getContextItems":
          channel.debug("(AutoDevWebview): context/getContextItems");
          break;
        case "command/run":
          this.handleCommandRun(message);
          break;
        default:
          channel.warn("(AutoDevWebview): unknown message type: ", messageType);
      }
    });
  }

  private handleCommandRun(message: any) {
    let commandName = "/" + message.data.slashCommandName;
    let input = message.data.input;

    if (input.startsWith(commandName)) {
      input = input.slice(commandName.length);
    }

    switch (message.data.slashCommandName) {
      case "codespace-keywords":
        vscode.commands.executeCommand(AutoDevCommand.CodespaceKeywordsAnalysis, input);
        break;
      case "codespace-code":
        vscode.commands.executeCommand(AutoDevCommand.CodespaceCodeAnalysis, input);
        break;
      default:
        channel.warn("(AutoDevWebview): unknown slash command: ", message.slashCommandName);
        break;
    }
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

  openSettings() {
    const context = getExtensionContext();
    vscode.commands.executeCommand("workbench.action.openSettings", {
      query: "@ext:" + context.extension.id,
    });
  }

  // See continue BrowserSerializedContinueConfig
  getBrowserSerialized({ reply, type }: WebviewEvent) {
    reply(type, {
      models: getChatModelList(),
      // contextProviders: [],
      // disableIndexing: false,
      // disableSessionTitles: false,
      allowAnonymousTelemetry: false,
    });
  }

  async streamChat({ data, reply, type }: WebviewEvent) {
    if (this._lastChatAbortController) {
      this._lastChatAbortController.abort();
      this._lastChatAbortController = undefined;
    }

    channel.debug(
      "(AutoDevWebview): Chat stream request with body",
      JSON.stringify(data)
    );

    const ac = new AbortController();

    this._lastChatAbortController = ac;

    try {
      const completion = await callAI(data, ac.signal);

      if (ac.signal.aborted) return;

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
      if (ac.signal.aborted) {
        return;
      }

      channel.error("(AutoDevWebview): Chat stream response error: ", err);
      channel.show();
      reply(type, {
        content: `Error: ${(err as Error).message}`,
      });
    } finally {
      reply(type, {
        done: true,
      });
    }
  }

  private send(
    messageType: string,
    data?: unknown,
    messageId?: string
  ): string {
    // channel.appendLine(`Sending message: ${messageType}`);
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
        }
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
