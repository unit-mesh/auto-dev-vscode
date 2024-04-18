export abstract class TemplateLoader {
	async load(name: string): Promise<string> {
		return Promise.reject(new Error("Method not implemented."));
	}
}