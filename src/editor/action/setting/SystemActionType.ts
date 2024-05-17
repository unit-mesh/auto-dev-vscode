import { AutoDevExtension } from "../../../AutoDevExtension";

export enum SystemActionType {
	Indexing = "Indexing codebase",
	SemanticSearchKeyword = "Natural language search (Keyword strategy)",
	SemanticSearchCode = "Natural language search (Code strategy)",
	SimilarCodeSearch = "Search for similar code",
}

export type SystemActionHandler = (extension: AutoDevExtension, type: SystemActionType) => void;
