import { CancellationToken } from "vscode";
import { SemanticSearch } from "./_base/SemanticSearch";
import { SearchOptions } from "./_base/SearchOptions";

export class BuiltinCodeSearch implements SemanticSearch {
	searchChunks(items: string[], maxResults: number, options: SearchOptions, cancellationToken: CancellationToken): Promise<any[]> {
		throw new Error("Method not implemented.");
	}
}