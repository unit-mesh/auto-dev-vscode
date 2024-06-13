import { injectable } from 'inversify';
import Parser, { Query, SyntaxNode } from 'web-tree-sitter';

import { LanguageIdentifier } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { ImportWithRefs } from '../../code-search/scope-graph/model/ImportWithRefs';
import { TextRange } from '../../code-search/scope-graph/model/TextRange';
import { ScopeGraph } from '../../code-search/scope-graph/ScopeGraph';
import { CodeFile, CodeFunction, CodeStructure, CodeVariable } from '../../editor/codemodel/CodeElement';
import { PositionElement } from '../../editor/codemodel/PositionElement';
import { LanguageProfile, LanguageProfileUtil } from './LanguageProfile';

export interface StructurerProvider {
	/**
	 * For wrapper int test and source code.
	 */
	init(langService: ILanguageServiceProvider): Promise<Query | undefined>;
	/**
	 * The `langId` property is a string representing the language identifier of the structurer provider.
	 */
	isApplicable(lang: LanguageIdentifier): any;

	/**
	 * Parses the given code and returns a `CodeFile` object.
	 */
	parseFile(code: string, path: string): Promise<CodeFile | undefined>;
}

@injectable()
export abstract class BaseStructurerProvider implements StructurerProvider {
	protected abstract langId: LanguageIdentifier;
	protected abstract config: LanguageProfile;
	protected abstract parser: Parser | undefined;
	protected abstract language: Parser.Language | undefined;

	abstract isApplicable(lang: LanguageIdentifier): boolean;

	abstract parseFile(code: string, path: string): Promise<CodeFile | undefined>;

	/**
	 * The `init` method is an asynchronous function that initializes the structurer provider with the given language service.
	 */
	async init(langService: ILanguageServiceProvider): Promise<Query | undefined> {
		const tsConfig = LanguageProfileUtil.from(this.langId)!!;
		const parser = await langService.getParser(this.langId);
		const language = await tsConfig.grammar(langService, this.langId);
		parser!.setLanguage(language);
		this.parser = parser;
		this.language = language;
		return tsConfig.structureQuery.query(language!!);
	}

	public insertLocation(node: SyntaxNode, model: PositionElement) {
		model.start = { row: node.startPosition.row, column: node.startPosition.column };
		model.end = { row: node.endPosition.row, column: node.endPosition.column };
	}

	public createFunction(syntaxNode: SyntaxNode, text: string): CodeFunction {
		const functionObj: CodeFunction = {
			vars: [],
			name: text,
			start: { row: 0, column: 0 },
			end: { row: 0, column: 0 },
		};

		const node = syntaxNode.parent ?? syntaxNode;
		functionObj.start = { row: node.startPosition.row, column: node.startPosition.column };
		functionObj.end = { row: node.endPosition.row, column: node.endPosition.column };
		return functionObj;
	}

	public createVariable(node: SyntaxNode, text: string, typ: string): CodeVariable {
		const variable: CodeVariable = {
			name: text,
			start: { row: 0, column: 0 },
			end: { row: 0, column: 0 },
			type: '',
		};

		variable.start = { row: node.startPosition.row, column: node.startPosition.column };
		variable.end = { row: node.endPosition.row, column: node.endPosition.column };
		return variable;
	}

	public initVariable(): CodeVariable {
		return { name: '', start: { row: 0, column: 0 }, end: { row: 0, column: 0 }, type: '' };
	}

	async fetchImportsWithinScope(scope: ScopeGraph, node: SyntaxNode, src: string): Promise<string[]> {
		let importWithRefs = this.retrieveImportReferences(scope, src, node);
		return importWithRefs.map(imp => imp.text);
	}

	/**
	 * The `retrieveImportReferences` method is a private method that retrieves all import references from a given source
	 * code that are within a specified syntax node.
	 *
	 * @param scope - An instance of `ScopeGraph`. This parameter represents the node graph of the source code.
	 * @param src - A string representing the source code from which to retrieve import references.
	 * @param node - An instance of `SyntaxNode`. This parameter represents the syntax node within which to search for import references.
	 *
	 * @returns An array of `ImportWithRefs` objects. Each object in the array represents an import reference that is
	 * within the specified syntax node. If no import references are found within the syntax node, an empty array is returned.
	 */
	public retrieveImportReferences(scope: ScopeGraph, src: string, node: SyntaxNode) {
		let imports: ImportWithRefs[] = scope.allImports(src);
		let range: TextRange = TextRange.from(node);

		return imports.filter(impRange => {
			let containedRanges = impRange.refs.filter(ref => {
				return ref.contains(range);
			});

			return containedRanges.length > 0;
		});
	}

	/**
	 * The `combineSimilarClasses` method is used to combine classes with the same name in a given code file.
	 * It merges the methods and fields of classes with the same name into a single class.
	 *
	 * @param codeFile - An object of type `CodeFile` which contains an array of classes. Each class has a name, methods, and fields.
	 *
	 * @returns The updated `codeFile` with combined classes.
	 *
	 * Note: If a class does not have any fields, they will not be added to the combined class.
	 *
	 */
	public combineSimilarClasses(codeFile: CodeFile) {
		let classMap = new Map<string, CodeStructure>();
		codeFile.classes.forEach(classItem => {
			if (classMap.has(classItem.name)) {
				const oldClass = classMap.get(classItem.name)!!;
				oldClass.methods.push(...classItem.methods);
				// oldClass.fields?.push(...classItem.fields ?? []);
				if (classItem.fields) {
					if (oldClass.fields) {
						oldClass.fields.push(...classItem.fields);
					} else {
						oldClass.fields = classItem.fields;
					}
				}
			} else {
				classMap.set(classItem.name, classItem);
			}
		});

		codeFile.classes = Array.from(classMap.values());
		return codeFile;
	}
}
