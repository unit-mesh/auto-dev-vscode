import { PlantUMLPresenter } from "./PlantUMLPresenter";
import { CodeFile } from "../CodeFile";
import { LANGUAGE_LINE_COMMENT_MAP } from "../../language/LanguageCommentMap";

export class CommentedUmlPresenter extends PlantUMLPresenter {
	present(file: CodeFile): string {
		const commentSymbol = LANGUAGE_LINE_COMMENT_MAP[file.language];
		const plantUml = this.render(file);

		return plantUml.split("\n").map((line) => {
			return `${commentSymbol} ${line}`;
		}).join("\n");
	}
}
