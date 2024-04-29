import { CancellationToken } from "vscode";
import { SearchOptions, SemanticSearch } from "./_base/SemanticSearch";

export class BuiltinCodeSearch implements SemanticSearch {
	searchChunks(items: string[], maxResults: number, options: SearchOptions, cancellationToken: CancellationToken): Promise<any[]> {
		throw new Error("Method not implemented.");
	}
}