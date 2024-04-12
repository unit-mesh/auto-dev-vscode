import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeDropdown,
    vsCodeTextArea,
    vsCodeLink,
} from "@vscode/webview-ui-toolkit"

provideVSCodeDesignSystem()
    .register(
        vsCodeButton(),
        vsCodeDropdown(),
        vsCodeTextArea(),
        vsCodeLink(),
    )

declare global {
    interface Window {
        acquireVsCodeApi(): {
            postMessage(message: any): void;
        };
    }
}

// Get access to the VS Code API from within the webview context
const vscode = typeof window.acquireVsCodeApi !== "undefined" ? window.acquireVsCodeApi() : null;

export * from "./RootContainer.js";
export * from "./ChatInput.js";
export * from "./ChatView.js";