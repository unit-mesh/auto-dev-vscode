import { SDKVersionProvider } from "./_base/SDKVersionProvider";

export class JavaSdkVersionProvider implements  SDKVersionProvider {
    getSDKVersion(): Promise<string> {
        throw new Error("Method not implemented.");
    }
}