import { injectable } from 'inversify';

import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import csharpscm from '../../code-search/schemas/indexes/c_sharp.scm?raw';
import { LanguageProfile, MemoizedQuery } from '../_base/LanguageProfile';

@injectable()
export class CsharpProfile implements LanguageProfile {
	languageIds = ['csharp'];
	fileExtensions = ['csharp'];
	grammar = (langService: ILanguageServiceProvider) => langService.getLanguage('csharp');
	isTestFile = (filePath: string) => filePath.endsWith('Test.cs') && filePath.includes('src/test');
	scopeQuery = new MemoizedQuery(csharpscm);
	hoverableQuery = new MemoizedQuery(`
      [(identifier)
       (type_identifier)] @hoverable
    `);
	methodQuery = new MemoizedQuery(`
      (method_declaration
        name: (identifier) @name.definition.method) @definition.method
    `);
		/**
		 * (struct_declaration
       name: (identifier) @definition.struct)
		 */
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
	 (struct_declaration
		 name: (identifier) @name.definition.struct) @definition.struct
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
			"local",
			// types
			"class",
			"struct",
			"enum",
			"typedef",
			"interface",
			"enumerator",
			// methods
			"method",
			// namespaces
			"namespace",
		],
	];
	autoSelectInsideParent = [];
	builtInTypes = [
		"bool",
		"sbyte",
		"byte",
		"short",
		"ushort",
		"int",
		"uint",
		"ulong",
		"float",
		"double",
		"decimal",
		"char",
		"string",
		"object"
	];
}
