import Velocity from "velocityjs";
import { TemplateContext } from "./TemplateContext";
import fs from "fs";

export class TemplateRender {
	private templateCache: { [filename: string]: string } = {};

	/**
	 * Retrieves the template content from the specified file.
	 *
	 * @param filename the name of the file containing the template
	 * @return the content of the template as a string
	 * @throws TemplateNotFoundError if the specified file cannot be found
	 */
	private retrieveDefaultTemplate(filename: string): string {
		if (this.templateCache.hasOwnProperty(filename)) {
			return this.templateCache[filename];
		}

		const string = fs.readFileSync(filename, "utf8");

		this.templateCache[filename] = string;
		return string;
	}

	private getDefaultFilePath(filename: string): string {
		return filename;
	}

	public render(template: string, context: TemplateContext): string {
		return Velocity.render(template, context);
	}
}