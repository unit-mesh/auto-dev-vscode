import { MemoizedQuery, TSLanguageConfig } from "../TSLanguageConfig";
import { getLanguage } from "../../language/parser";

export const GoTSConfig: TSLanguageConfig = {
	languageIds: ["Go"],
	fileExtensions: ["go"],
	grammar: () => getLanguage('go'),
	scopeQuery: new MemoizedQuery(""),
	hoverableQuery: new MemoizedQuery(`
     [(identifier)
       (type_identifier)
       (package_identifier)
       (field_identifier)] @hoverable
    `),
	classQuery: new MemoizedQuery(`
	    (type_declaration
			  (type_spec 
			    (type_identifier @name.definition.class)
		      (struct_type)))  @definition.class

    `),
	methodQuery: new MemoizedQuery(`
      (function_declaration
			  name: (identifier) @name.definition.method) @definition.method

    `),
	namespaces: [
		// variables
		["const", "var", "func", "module"],
		// types
		["struct", "interface", "type"],
		// misc.
		["member"],
		["label"],
	]
};
  