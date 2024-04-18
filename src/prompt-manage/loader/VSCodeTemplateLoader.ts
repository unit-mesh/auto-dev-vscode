import { TemplateLoader } from "./TemplateLoader";
import { getExtensionUri } from "../../context";
import { Uri } from "vscode";

export class VSCodeTemplateLoader extends TemplateLoader {
	private extensionUri: Uri | undefined;

	constructor() {
		super();
		this.extensionUri = getExtensionUri();
	}

	async load(name: string): Promise<string> {
		return super.load(name);
	}
}