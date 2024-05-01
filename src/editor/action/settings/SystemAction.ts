import { AutoDevExtension } from "../../../AutoDevExtension";

export enum SystemAction {
	Indexing = "Indexing codebase",
	IntentionSemanticSearch = "Intention-based semantic search",
	SimilarCodeSearch = "Search for similar code",
}

export type SystemActionHandler = (extension: AutoDevExtension) => void;
