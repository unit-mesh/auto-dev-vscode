import { EmbeddingsProvider } from "./_base/EmbeddingsProvider";
import { LocalEmbeddingsProvider } from "./LocalEmbeddingsProvider";
import vscode from "vscode";


export namespace EmbeddingsProviderManager {
	export function init(context: vscode.ExtensionContext) {
		LocalEmbeddingsProvider.getInstance().init(context.extensionPath);
	}

	export function create(): EmbeddingsProvider {
		// todo: add more provider by settings
		return LocalEmbeddingsProvider.getInstance();
	}
}