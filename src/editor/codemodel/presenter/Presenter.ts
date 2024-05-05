import { CodeFile } from "../CodeFile";

export interface Presenter {
	present(file: CodeFile): string;
}
