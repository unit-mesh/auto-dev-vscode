import { MemoizedQuery, LanguageConfig } from "../_base/LanguageConfig";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import javascm from '../../schemas/indexes/java.scm?raw';

export const JavaLangConfig: LanguageConfig = {
	languageIds: ['java'],
	fileExtensions: ['java'],
	grammar: (langService: TSLanguageService) => langService.getLanguage('java'),
	// todo: load from `.scm` file
	scopeQuery: new MemoizedQuery(javascm),
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
	blockCommentQuery: new MemoizedQuery(`
		((block_comment) @block_comment
			(#match? @block_comment "^\\\\/\\\\*\\\\*")) @docComment`
	),
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
