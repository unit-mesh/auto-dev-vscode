import * as vscode from "vscode";
import { getExtensionUri } from "../../context";

import { callAI, getChatModelList } from "./langchain-tools";

type WebviewEvent = {
  id: string;
  type: string;
  data: any;
  reply: (data: unknown) => void;
};

export class AutoDevWebviewProtocol {
  private _onMessage = new vscode.EventEmitter<any>();
  _webview: vscode.Webview;
  _webviewListener?: vscode.Disposable;

  get onMessage() {
    return this._onMessage.event;
  }

  constructor(webview: vscode.Webview) {
    this._webview = webview;

    webview.onDidReceiveMessage((message) => {
      const messageId = message && message.messageId;
      const messageType = message && message.messageType;
      if (!(messageId || messageType)) {
        return;
      }

      const reply = (data: unknown) => {
        this._webview.postMessage({
          messageId: messageId,
          messageType: "onLoad",
          data: JSON.stringify(data),
        });
      };

      switch (messageType) {
        case "getOpenFiles":
          return this.getOpenFiles({
            id: messageId,
            type: messageType,
            data: message.data,
            reply,
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
          console.log("unknown mesaage type: %s", messageType);
      }
    });
  }

  onLoad({ reply }: WebviewEvent) {
    reply({
      windowId: "1",
      serverUrl: "",
      workspacePaths: [],
      vscMachineId: "1111",
      vscMediaUrl: getExtensionUri().toString(),
    });
  }

  getOpenFiles({ reply }: WebviewEvent) {
    reply([]);
  }

  // See continue BrowserSerializedContinueConfig
  getBrowserSerialized({ reply }: WebviewEvent) {
    reply({
      models: getChatModelList(),
      // contextProviders: [],
      // disableIndexing: false,
      // disableSessionTitles: false,
      allowAnonymousTelemetry: false,
    });
  }

  async streamChat({ data, reply }: WebviewEvent) {
    console.log("streamChat", JSON.stringify(data));

    try {
      const completion = await callAI(data);

      if (!completion) {
        reply({ content: "暂不支持此模型的使用" });
        reply({ done: true });
        return;
      }

      for await (const chunk of completion) {
        reply({
          content: chunk.content,
        });
      }
    } catch (err) {
      reply({
        content: `Error: ${(err as Error).message}`,
      });
    } finally {
      reply({
        done: true,
      });
    }
  }

  request(messageType: string, data: any) {
    throw new Error("Method not implemented.");
  }
}

export type WebviewProtocol = {
  newSessionWithPrompt: [{ prompt: string }, void];
  getTerminalContents: [undefined, string];
};
