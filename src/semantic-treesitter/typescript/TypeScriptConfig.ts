import { TSLanguageConfig, MemoizedQuery } from "../TSLanguageConfig";
import { getLanguage } from "../../language/parser";

let tsLanguage = getLanguage('typescript');

export const TypeScriptConfig: TSLanguageConfig = {
	languageIds: ["TypeScript", "TSX"],
	fileExtensions: ["ts", "tsx"],
	grammar: () => {
		return tsLanguage;
	},
	scopeQuery: new MemoizedQuery(""),
	hoverableQuery: new MemoizedQuery(`
      [(identifier)
        (property_identifier)
        (shorthand_property_identifier)
        (shorthand_property_identifier_pattern)
        (statement_identifier)
        (type_identifier)] @hoverable
    `),
	classQuery: new MemoizedQuery(`
      (class_declaration
        (identifier) @name.definition.class) @definition.class
    `),
	methodQuery: new MemoizedQuery(`
      (function_declaration
        (identifier) @name.definition.method) @definition.method
    `),
	namespaces: [
		[
			//variables
			"constant",
			"variable",
			"property",
			"parameter",
			// functions
			"function",
			"method",
			"generator",
			// types
			"alias",
			"enum",
			"enumerator",
			"class",
			"interface",
			// misc.
			"label",
		]
	]
};
  