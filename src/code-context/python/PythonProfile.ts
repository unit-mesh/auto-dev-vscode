import { injectable } from 'inversify';

import python from '../../code-search/schemas/indexes/python.scm?raw';
import { LanguageProfile, MemoizedQuery } from '../_base/LanguageProfile';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

@injectable()
export class PythonProfile implements LanguageProfile {
	languageIds = ['python'];
	fileExtensions = ['py'];
	grammar = (langService: ILanguageServiceProvider) => langService.getLanguage('python');
	isTestFile = (filePath: string) => filePath.endsWith('_test.py');
	scopeQuery = new MemoizedQuery(python);
	hoverableQuery = new MemoizedQuery(`
     (identifier) @hoverable
  `);
	classQuery = new MemoizedQuery(`
	    (class_definition
				(identifier) @type_identifier) @type_declaration
    `);
	methodQuery = new MemoizedQuery(`
      (function_definition
				name: (identifier)@name.definition.method
			) @definition.method
    `);
	blockCommentQuery = new MemoizedQuery(`
		(expression_statement
			(string) @docComment)
	`);
	methodIOQuery = new MemoizedQuery(`
		(function_definition
				name: (identifier) @function.identifier
		) @function
	`);
	structureQuery = new MemoizedQuery(``);
	namespaces = [['class', 'function', 'parameter', 'variable']];
	autoSelectInsideParent = [];
	builtInTypes = [
		'int',
		'float',
		'str',
		'bool',
		'list',
		'dict',
		'tuple',
		'set',
		'complex',
		'bytes',
		'bytearray',
		'memoryview',
		'range',
		'frozenset',
		'type',
		'None',
		'NotImplemented',
		'Ellipsis',
		'object',
	];
}
