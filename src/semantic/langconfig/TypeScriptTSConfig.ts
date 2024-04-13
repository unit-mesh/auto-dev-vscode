import { MemoizedQuery, TSLanguageConfig } from "./TSLanguageConfig";
import { TSLanguageService } from "../../language/service/TSLanguageService";
import { SupportedLanguage } from "../../language/SupportedLanguage";

export const TypeScriptTSConfig: TSLanguageConfig = {
	languageIds: ["typescript", "typescriptreact"],
	fileExtensions: ["ts", "tsx"],
	grammar: (langService: TSLanguageService, langId: SupportedLanguage) => {
		if(langId === "typescriptreact") {
			return langService.getLanguage('typescriptreact');
		}

		return langService.getLanguage('typescript');
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
	structureQuery: new MemoizedQuery(`
    (import_statement
      (import_clause
        (named_imports
          (import_specifier
            name: (identifier)? @source-name
            alias: (identifier)? @as-name
          )
        )
      )
    )
    
    (import_statement
      (import_clause (identifier)?  @use-name)
      source: (string)? @import-source
    )
    
    (import_statement
      source: (_)? @import-source
    )

    (class_declaration
      name: (type_identifier ) @class-name
      body: (class_body
        (method_definition
          name: (property_identifier) @class-method-name
          parameters: (formal_parameters (required_parameter)? @parameter)
        )
      )
    )
		
	  (interface_declaration
	     name: (type_identifier) @interface-name
	     body: (interface_body (
	       method_signature
	         name: (property_identifier) @interface.method.id
	         parameters: (formal_parameters (required_parameter)? @parameter)
	         return_type: (type_annotation)? @interface.returnType
	     ))
	  )
					
		(program (function_declaration
          name: (identifier) @function-name))
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
