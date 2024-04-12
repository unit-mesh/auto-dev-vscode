import { LitElement, html, css} from "lit";

import { customElement, property } from "lit/decorators.js";

// TODO: rich text chat input
@customElement("chat-input")
export class ChatInput extends LitElement {
    @property()
    value: string = "";

    protected render(): unknown {
        return html`
            <vscode-text-area 
                    .value=${this.value}
                    @change=${this._onInput}
            ></vscode-text-area>
            <vscode-button @click=${this._onSubmit}>Send</vscode-button>
        `;
    }

    private _onSubmit() {
        this.dispatchEvent(new CustomEvent("ev__chat_send", {
            detail: this.value,
            bubbles: true,
            composed: true,
        }));
        this.value = "";
    }

    private _onInput(event: InputEvent) {
        this.value = (event.target as HTMLInputElement).value;
    }

    static styles = css`
        :host {
            display: grid;
            grid-template-columns: 1fr max-content;
            gap: 10px;
            align-items: stretch;
            align-content: stretch;
        }
    `;
}