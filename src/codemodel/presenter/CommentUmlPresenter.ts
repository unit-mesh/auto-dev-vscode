import { PlantUMLPresenter } from "./PlantUMLPresenter";
import { CodeFile } from "../CodeFile";
import { LANGUAGE_COMMENT_MAP } from "../../language/LanguageCommentMap";

export class CommentUmlPresenter extends PlantUMLPresenter {
	convert(file: CodeFile): string {
		const commentSymbol = LANGUAGE_COMMENT_MAP[file.language];
		const plantUml = this.render(file);

		return plantUml.split("\n").map((line) => {
			return `${commentSymbol} ${line}`;
		}).join("\n");
	}
}
