import { injectable } from 'inversify';

import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import javascm from '../../code-search/schemas/indexes/java.scm?raw';
import { LanguageProfile, MemoizedQuery } from '../_base/LanguageProfile';

@injectable()
export class JavaProfile implements LanguageProfile {
	languageIds = ['java'];
	fileExtensions = ['java'];
	grammar = (langService: ILanguageServiceProvider) => langService.getLanguage('java');
	isTestFile = (filePath: string) => filePath.endsWith('Test.java') && filePath.includes('src/test');
	scopeQuery = new MemoizedQuery(javascm);
	hoverableQuery = new MemoizedQuery(`
      [(identifier)
       (type_identifier)] @hoverable
    `);
	methodQuery = new MemoizedQuery(`
      (method_declaration
        name: (identifier) @name.definition.method) @definition.method
    `);
	classQuery = new MemoizedQuery(`
      (class_declaration
        name: (identifier) @name.definition.class) @definition.class
    `);
	blockCommentQuery = new MemoizedQuery(`
		((block_comment) @block_comment
			(#match? @block_comment "^\\\\/\\\\*\\\\*")) @docComment`);
	packageQuery = new MemoizedQuery(`
		(package_declaration
			(scoped_identifier) @package-name)
	`);
	structureQuery = new MemoizedQuery(`
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
		      name: ((identifier) @class-name)
	        interfaces: (super_interfaces (type_list (type_identifier) @impl-name))?
	        body:
	          (class_body
	            (field_declaration
                (modifiers) @field-modifiers
                (type_identifier) @field-type
                (variable_declarator) @field-decl
              )?
            )
		    )
			)
  `);
	methodIOQuery = new MemoizedQuery(`
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
      )`);

	fieldQuery = new MemoizedQuery(`
		(field_declaration
			(type_identifier) @field-type
			(variable_declarator
				(identifier) @field-name
			)
		) @field-declaration
	`);
	namespaces = [
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
			// devops.
			'label',
		],
	];
	autoSelectInsideParent = [];
	builtInTypes = [
		'boolean',
		'byte',
		'char',
		'short',
		'int',
		'long',
		'float',
		'double',
		'void',
		'Boolean',
		'Byte',
		'Character',
		'Short',
		'Integer',
		'Long',
		'Float',
		'Double',
		'String',
		'Array',
		'List',
		'Map',
		'Set',
		'Collection',
		'Iterable',
		'Iterator',
		'Stream',
		'Optional',
	];
}
