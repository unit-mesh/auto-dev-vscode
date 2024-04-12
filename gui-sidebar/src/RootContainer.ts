import {customElement} from "lit/decorators.js"

import {LitElement, css, html} from 'lit'

@customElement('root-container')
export class RootContainer extends LitElement {
    protected render(): unknown {
        return html`
            <div id="app-root">
                <slot></slot>
            </div>
        `
    }

    static get styles() {
        return css`
            #app-root {
                display: grid;
                height: 100%;
            }
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'root-container': RootContainer
    }
}
