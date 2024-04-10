import { Uri } from "vscode";

export interface DocumentKey {
	uri: Uri;
	version: number;
}