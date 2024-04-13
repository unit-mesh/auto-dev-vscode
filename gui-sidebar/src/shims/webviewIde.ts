import { MessageIde } from "./messageIde";
import { WebviewProtocol } from "./webviewProtocol";
import { ideRequest } from "./ide";
function r<T extends keyof WebviewProtocol>(
    messageType: T,
    data: WebviewProtocol[T][0]
): Promise<WebviewProtocol[T][1]> {
    return ideRequest(messageType, data);
}

export class WebviewIde extends MessageIde {
    constructor() {
        super(r);
    }
}
