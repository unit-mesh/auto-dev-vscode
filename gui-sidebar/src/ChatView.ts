import {LitElement, html, css} from "lit";
import {customElement, property} from "lit/decorators.js";

@customElement("chat-view")
export class ChatView extends LitElement {
    @property()
    chats: any[] = [];

    protected render(): unknown {
        return html`
            <ul>
                ${this.chats.map(chat => html`
                    <li>${chat.name}</li>
                `)}
            </ul>
            <!--     listen on ev__chat_send event       -->
            <chat-input @ev__chat_send="${this._onChatSend}"></chat-input>
        `;
    }

    private _onChatSend(event: CustomEvent) {
        this.chats = [
            ...this.chats,
            {name: event.detail}
        ];
    }

    static styles = css`
        :host {
            height: 100%;
            display: grid;
            grid-template-rows: 1fr max-content;
        }
        
        ul {
            list-style-type: none;
            padding: 0;
        }
    `;
}