import { PlantUMLPresenter } from "./PlantUMLPresenter.ts";
import { CodeFile } from "../CodeFile.ts";

export class CommentUmlPresenter extends PlantUMLPresenter {
	convert(file: CodeFile): string {
		const plantUml = this.render(file);
		const result = plantUml.split("\n").map((line) => {
			return `// ${line}`;
		}).join("\n");

		return result;
	}
}