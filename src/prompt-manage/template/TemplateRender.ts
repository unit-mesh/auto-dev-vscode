import Velocity from "velocityjs";
import { TemplateContext } from "./TemplateContext";
import fs from "fs";
import { TemplateLoader } from "../loader/TemplateLoader";
import { VSCodeTemplateLoader } from "../loader/VSCodeTemplateLoader";

export class TemplateRender {
	private templateCache: { [filename: string]: string } = {};
	private templateLoader: TemplateLoader;

	constructor(templateLoader?: TemplateLoader) {
		if (templateLoader === undefined) {
			templateLoader = new VSCodeTemplateLoader();
		}
		this.templateLoader = templateLoader;
	}

	/**
	 * Retrieves the template for a given filename.
	 *
	 * @param filename the name of the file for which the template is requested
	 * @return the template string for the specified filename, or the default template if no override is found
	 */
	async getTemplate(filename: string): Promise<string> {
		// todo: check with prompt override
		return await this.templateLoader.load(filename);
	}

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
		return Velocity.render(template, {
			context
		});
	}
}