import { CodeFile } from "../CodeFile.ts";

export interface Presenter {
	convert(file: CodeFile): string;
}