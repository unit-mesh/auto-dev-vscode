import { MemoizedQuery, TSLanguageConfig } from "../TSLanguageConfig";
import { getLanguage } from "../../language/parser";

export const JavaTSConfig: TSLanguageConfig = {
	languageIds: ['Java'],
	fileExtensions: ['java'],
	grammar: () => getLanguage('java'),
	scopeQuery: new MemoizedQuery(""),
	hoverableQuery: new MemoizedQuery(`
      [(identifier)
       (type_identifier)] @hoverable
    `),
	methodQuery: new MemoizedQuery(`
      (method_declaration
        name: (identifier) @name.definition.method) @definition.method
    `),
	classQuery: new MemoizedQuery(`
      (class_declaration
        name: (identifier) @name.definition.class) @definition.class
    `),
	structureQuery: new MemoizedQuery(`
			(package_declaration
			  (scoped_identifier) @package-name)
			
			(import_declaration
			  (scoped_identifier) @import-name)
			
			(method_declaration
			  type: (type_identifier) @method-returnType
			  name: (identifier) @method-id
			  parameters: (formal_parameters
			    (formal_parameter 
			        (type_identifier) @method-param.type
			        (identifier) @method-param.value)
			        @method-params
			    )
			)

			(program
			    (class_declaration
			      name: (identifier) @class-name
			        interfaces: (super_interfaces (type_list (type_identifier)  @impl-name))?
			    )
			)
  `),
	methodIOQuery: new MemoizedQuery(`
		(method_declaration
		  type: (type_identifier) @returnType
		  name: (identifier) @id
		  parameters: (formal_parameters
		    (formal_parameter 
		        (type_identifier) @param.type
		        (identifier) @param.value)
		        @param
		    )
		)`),
	namespaces: [
		[
			// variables
			'local',
			// functions
			'method',
			// namespacing, modules
			'package',
			'module',
			// types
			'class',
			'enum',
			'enumConstant',
			'record',
			'interface',
			'typedef',
			// misc.
			'label',
		]
	]
};
  