/**
 * Represents a term used in a specific team's language.
 */
export interface TeamTerm {
	id: string;
	/// term should be in english, like `function`
	/// for example: `永远的神` will be `yyds`
	term: string;
	/// origin language, like Chinese
	localized: string;
}
