import { injectable } from 'inversify';

import tsscm from '../../code-search/schemas/indexes/typescript.scm?raw';
import { LanguageProfile, MemoizedQuery } from '../_base/LanguageProfile';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';
import { LanguageIdentifier } from 'base/common/languages/languages';

@injectable()
export class TypeScriptProfile implements LanguageProfile {
	languageIds = ['typescript', 'typescriptreact'];
	fileExtensions = ['ts', 'tsx'];
	grammar = (langService: ILanguageServiceProvider, langId?: LanguageIdentifier) => {
		if (langId === 'typescriptreact') {
			return langService.getLanguage('typescriptreact');
		}

		return langService.getLanguage('typescript');
	};
	isTestFile = (filePath: string) => filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts');
	scopeQuery = new MemoizedQuery(tsscm);
	hoverableQuery = new MemoizedQuery(`
      [(identifier)
        (property_identifier)
        (shorthand_property_identifier)
        (shorthand_property_identifier_pattern)
        (statement_identifier)
        (type_identifier)] @hoverable
    `);
	classQuery = new MemoizedQuery(`
      (class_declaration
        (type_identifier) @name.definition.class) @definition.class
    `);
	methodQuery = new MemoizedQuery(`
      (function_declaration
        (identifier) @name.definition.method) @definition.method

			(generator_function_declaration
				name: (identifier) @name.identifier.method
			) @definition.method

			(export_statement
			  declaration: (lexical_declaration
			    (variable_declarator
			      name: (identifier) @name.identifier.method
			      value: (arrow_function)
		      )
			  ) @definition.method
			)

      (class_declaration
        name: (type_identifier)
        body: (class_body
          ((method_definition
            name: (property_identifier) @name.definition.method
          ) @definition.method)
        )
      )
    `);
	blockCommentQuery = new MemoizedQuery(`
		((comment) @comment
			(#match? @comment "^\\\\/\\\\*\\\\*")) @docComment
	`);
	structureQuery = new MemoizedQuery(`
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
      name: (type_identifier) @class-name
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
	       (property_signature
            name: (property_identifier)? @interface-prop-name
            type: (_)? @interface-prop-type
         )?
	       (method_signature
	         name: (property_identifier) @interface.method.id
	         parameters: (formal_parameters (required_parameter)? @parameter)
	           return_type: (type_annotation)? @interface.returnType
	         )?
	       )?
	     )
	  )

		(program (function_declaration
          name: (identifier) @function-name))
		`);
	namespaces = [
		[
			//variables
			'constant',
			'variable',
			'property',
			'parameter',
			// functions
			'function',
			'method',
			'generator',
			// types
			'alias',
			'enum',
			'enumerator',
			'class',
			'interface',
			// devops.
			'label',
		],
	];
	autoSelectInsideParent = ['export_statement'];
	builtInTypes = [
		'Array',
		'String',
		'Number',
		'Boolean',
		'Object',
		'Symbol',
		'Function',
		'Promise',
		'void',
		'null',
		'undefined',
		'unknown',
		'any',
		'never',
	];
}
