import { Uri } from "vscode";

export interface FileCacheManger<T> {
	setDocument(uri: Uri, version: number, file: T): void;

	getDocument(uri: Uri, version: number): T | undefined;
}
