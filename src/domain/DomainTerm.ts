export interface DomainTerm {
	id?: string;
	// origin language, like Chinese
	localized: string;
	// english translation, like `function`
	// - `永远的神` will be `yyds`
	term: string;
}