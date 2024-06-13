import fs from 'node:fs';

import Velocity from 'velocityjs';

import { TemplateLoader } from '../loader/TemplateLoader';
import { TemplateContext } from './TemplateContext';

export class TemplateRender {
	private templateCache: { [filename: string]: string } = {};

	constructor(private templateLoader: TemplateLoader) {}

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

		const string = fs.readFileSync(filename, 'utf8');

		this.templateCache[filename] = string;
		return string;
	}

	/**
	 * The `render` method is a public method that takes in a template string and a context of type `TemplateContext`.
	 * It then uses these parameters to render a new template string.
	 *
	 * @param {string} template - The template string to be rendered.
	 * @param {TemplateContext} context - The context to be used in rendering the template.
	 *
	 * @returns {string} - The rendered template string.
	 *
	 * Note: In older versions, the context would be `TemplateContext` only. The context was previously defined
	 * as `{ context: context}`.
	 */
	public render(template: string, context: TemplateContext): string {
		let newContext = {
			context,
		};

		/// old version context will be TemplateContext only, context, { context: context}
		let finalContext = Object.assign({}, context, newContext);

		return Velocity.render(template, finalContext);
	}
}
