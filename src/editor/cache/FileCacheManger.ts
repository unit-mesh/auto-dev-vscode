import { Uri } from 'vscode';

export interface FileCacheManger<T> {
	getDocument(uri: Uri, version: number): T | undefined;
	setDocument(uri: Uri, version: number, file: T): void;
}
