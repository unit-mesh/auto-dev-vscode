import { MemoizedQuery, LanguageConfig } from "../_base/LanguageConfig";
import { TSLanguageService } from "../../language/service/TSLanguageService";

export const GoLangConfig: LanguageConfig = {
	languageIds: ["Go"],
	fileExtensions: ["go"],
	grammar: (langService: TSLanguageService) => langService.getLanguage('go'),
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
	structureQuery: new MemoizedQuery(`
			(package_clause
			  (package_identifier) @package-name)

			(import_declaration
			  (import_spec
			    path: (_) @import-name))
			                  
      (import_declaration
        (import_spec_list
	  		  (import_spec
				    path: (_) @import-name)))

			(
				(function_declaration
			    name: (identifier) @function-name)
		    @function-body
	    )
			
		  (
		    (method_declaration
          receiver: (_)? @receiver-struct-name
          name: (_)? @method-name)
        @method-body
      )
            
			(type_declaration
			  (type_spec 
			    name: (_) @type-name
			    type: (struct_type 
			      (field_declaration_list 
			        (field_declaration 
			           name: (_)? @field-name
			           type: (_)? @field-type
			        )
			      )
			    )
			   )
			  )
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
