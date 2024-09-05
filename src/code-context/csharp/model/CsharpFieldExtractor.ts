import { LanguageProfile, MemoizedQuery } from 'src/code-context/_base/LanguageProfile';
import { TreeSitterFile } from 'src/code-context/ast/TreeSitterFile';
import { TreeSitterFileManager } from 'src/editor/cache/TreeSitterFileManager';
import vscode, { TextDocumentChangeEvent, Uri } from 'vscode';
import Parser from 'web-tree-sitter';

import { ILanguageServiceProvider } from 'base/common/languages/languageService';

export class CsharpFieldExtractor {
	private parser: TreeSitterFile;
	private src: vscode.TextDocument;

	constructor(text: vscode.TextDocument,  Parser: TreeSitterFile) {
		this.src = text;
		this.parser = Parser;
	}

	public extractFields(): FieldInfo[] {
		const tree = this.parser.tree;
		const queryObj = new MemoizedQuery(`
				(field_declaration
					(attribute_list)? @attribute
					(modifier)* @modifier
					(variable_declaration
							(variable_declarator
									(identifier) @name
							)
							(type) @type
					)
					(comment)? @comment
			)
				`);
		const query = queryObj.query(this.parser.tsLanguage);
		const fields: FieldInfo[] = [];
    const matches = query.matches(tree.rootNode);
        for (const match of matches) {
            const field: FieldInfo = {
                attributes: this.extractAttributes(match),
                modifiers: this.extractModifiers(match),
                type: this.extractType(match),
                name: this.extractName(match),
                comment: this.extractComment(match)
            };
            fields.push(field);
        }

        return fields;
    }

    private extractAttributes(match: Parser.QueryMatch): string[] {
        return match.captures.filter(capture => capture.name === 'attribute').map(capture => capture.node.text);
    }

    private extractModifiers(match: Parser.QueryMatch): string[] {
        return match.captures.filter(capture => capture.name === 'modifier').map(capture => capture.node.text);
    }

    private extractType(match: Parser.QueryMatch): string {
        const capture = match.captures.find(capture => capture.name === 'type');
        return capture ? capture.node.text : '';
    }

    private extractName(match: Parser.QueryMatch): string {
        const capture = match.captures.find(capture => capture.name === 'name');
        return capture ? capture.node.text : '';
    }

    private extractComment(match: Parser.QueryMatch): string {
        const capture = match.captures.find(capture => capture.name === 'comment');
        return capture ? capture.node.text : '';
    }
}

export interface FieldInfo {
    attributes: string[];
    modifiers: string[];
    type: string;
    name: string;
    comment: string;
}
