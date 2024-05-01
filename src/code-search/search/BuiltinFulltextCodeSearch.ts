import { CancellationToken } from "vscode";
import { SemanticSearch } from "./_base/SemanticSearch";
import { SearchOptions } from "./_base/SearchOptions";

/**
 * The `BuiltinFulltextCodeSearch` class is a TypeScript class that implements the `SemanticSearch` interface.
 * This class is designed to perform full-text code searches in a given set of items.
 *
 * @remarks
 * This class is part of the built-in functionality of the system and is exported for use in other modules.
 */
export class BuiltinFulltextCodeSearch implements SemanticSearch {
	searchChunks(items: string[], maxResults: number, options: SearchOptions, cancellationToken: CancellationToken): Promise<any[]> {
		throw new Error("Method not implemented.");
	}
}