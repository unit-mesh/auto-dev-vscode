import { MemoizedQuery, TSLanguageConfig } from "../_base/TSLanguageConfig";
import { TSLanguageService } from "../../language/service/TSLanguageService";

export const JavaLangConfig: TSLanguageConfig = {
	languageIds: ['java'],
	fileExtensions: ['java'],
	grammar: (langService: TSLanguageService) => langService.getLanguage('java'),
	// todo: load from `.scm` file
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
        type: (_) @method-returnType
        name: (identifier) @method-name
        parameters: (formal_parameters
          (formal_parameter 
              (type_identifier) @method-param.type
              (identifier) @method-param.value
          )? 
          @method-params)
        body: (block) @method-body
      )

			(program
			    (class_declaration
			      name: (identifier) @class-name
			        interfaces: (super_interfaces (type_list (type_identifier)  @impl-name))?
			    ) @class-body
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
