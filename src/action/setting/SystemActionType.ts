import { AutoDevExtension } from "../../AutoDevExtension";

export enum SystemActionType {
	Indexing = "Indexing codebase",
	SemanticSearchKeyword = "Natural language search (Hyde Keyword strategy)",
	SemanticSearchCode = "Natural language search (Hyde Code strategy)",
	SimilarCodeSearch = "Search for similar code (Recently + TF-IDF)",
	OpenSettings = "Open settings",
}

export type SystemActionHandler = (extension: AutoDevExtension, type: SystemActionType) => void;
