import { CodeFile } from "../CodeElement";

export interface Presenter {
	present(file: CodeFile): string;
}
