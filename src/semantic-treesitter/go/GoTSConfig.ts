import * as vscode from "vscode";
import { MemoizedQuery, TSLanguageConfig } from "../TSLanguageConfig";
import { getLanguage } from "../../language/parser";

export const GoTSConfig: TSLanguageConfig = {
	languageIds: ["Go"],
	fileExtensions: ["go"],
	grammar: (uri?: vscode.Uri) => getLanguage(uri, 'go'),
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
			    (import_path
			      (string_literal) @import-name))) @import-name
			
			(function_declaration
			  name: (identifier) @function-name)
			
			(method_declaration
			  name: (identifier) @method-name)
			
			(type_declaration
			  (type_spec 
			    (type_identifier) @type-name))
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
  