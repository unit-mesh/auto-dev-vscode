import { Uri } from "vscode";
import { TreeSitterFile } from "../semantic-treesitter/TreeSitterFile";

export interface FileCacheManger<T> {
	setDocument(uri: Uri, version: number, file: T): void;

	getDocument(uri: Uri, version: number): T | undefined;
}