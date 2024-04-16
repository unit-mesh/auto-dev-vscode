import { CodeFile } from "../CodeFile";

export interface Presenter {
	convert(file: CodeFile): string;
}
