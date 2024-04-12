import { MemoizedQuery, TSLanguageConfig } from "./TSLanguageConfig";
import { LangServiceUtil } from "../../language/TSLanguageService";

export const TypeScriptTSConfig: TSLanguageConfig = {
	languageIds: ["TypeScript", "TSX"],
	fileExtensions: ["ts", "tsx"],
	grammar: () => LangServiceUtil.getLanguage('typescript'),
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
	structureQuery: new MemoizedQuery(`
			(import_statement
			  (import_clause
			    (named_import_clause
			      (import_specifier
			        (identifier) @import-name)))) @import-name
			)
			
			(class_declaration
			  name: (identifier) @class-name
			  body: (class_body
			    (method_definition
			      name: (property_identifier) @class-method-name
			      parameters: (formal_parameters (identifier)? @parameter)
			    )
			  )
			)
			
			(interface_declaration
			  (identifier) @interface-name
			)
						
			(program (function_declaration
			      name: * @function-name))
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
