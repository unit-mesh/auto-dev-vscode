import { ILanguageServiceProvider } from "base/common/languages/languageService";
import { LanguageProfile, MemoizedQuery } from "src/code-context/_base/LanguageProfile";
import { TreeSitterFile } from "src/code-context/ast/TreeSitterFile";
import { TreeSitterFileManager } from "src/editor/cache/TreeSitterFileManager";
import vscode, { TextDocumentChangeEvent, Uri } from 'vscode';
import Parser from "web-tree-sitter";

export class CsharpMethodExtractor {
    private parser: TreeSitterFile;
		private src:vscode.TextDocument


    constructor(text:  vscode.TextDocument,Parser:TreeSitterFile) {
     this.src=text;
		 this.parser= Parser;
    }

    public extractMethods(): MethodInfo[] {
        const tree =this.parser.tree;
				const queryObj=   new MemoizedQuery(`
				(method_declaration
					(attribute_list)? @attribute
					(modifier)* @modifier
					(type) @return_type
					(identifier) @name
					(parameter_list
							(parameter
									(type) @param_type
									(identifier) @param_name
							)*
					) @parameters
					(block) @body
			)
				`)
			const query=	queryObj.query(this.parser.tsLanguage)
        const methods: MethodInfo[] = [];




        const matches = query.matches(tree.rootNode);
        for (const match of matches) {
            const method: MethodInfo = {
                attributes: this.extractAttributes(match),
                modifiers: this.extractModifiers(match),
                returnType: this.extractReturnType(match),
                name: this.extractName(match),
                parameters: this.extractParameters(match),
                body: this.extractBody(match),
                methodComment: this.extractMethodComment(match),
                parameterComments: this.extractParameterComments(match)
            };
            methods.push(method);
        }

        return methods;
    }


    private extractAttributes(match: Parser.QueryMatch): string[] {
			return match.captures.filter(capture => capture.name === 'attribute').map(capture => capture.node.text);
	}

	private extractModifiers(match: Parser.QueryMatch): string[] {
			return match.captures.filter(capture => capture.name === 'modifier').map(capture => capture.node.text);
	}

	private extractReturnType(match: Parser.QueryMatch): string {
			const capture = match.captures.find(capture => capture.name === 'return_type');
			return capture ? capture.node.text : '';
	}

	private extractName(match: Parser.QueryMatch): string {
			const capture = match.captures.find(capture => capture.name === 'name');
			return capture ? capture.node.text : '';
	}

	private extractParameters(match: Parser.QueryMatch): ParameterInfo[] {
			const parameters: ParameterInfo[] = [];
			const parameterCaptures = match.captures.filter(capture => capture.name === 'param_type' || capture.name === 'param_name');
			for (let i = 0; i < parameterCaptures.length; i += 2) {
					parameters.push({
							type: parameterCaptures[i].node.text,
							name: parameterCaptures[i + 1].node.text
					});
			}
			return parameters;
	}

	private extractBody(match: Parser.QueryMatch): string {
			const capture = match.captures.find(capture => capture.name === 'body');
			return capture ? capture.node.text : '';
	}

	private extractMethodComment(match: Parser.QueryMatch): string {
			const capture = match.captures.find(capture => capture.name === 'method_comment');
			return capture ? capture.node.text : '';
	}

	private extractParameterComments(match: Parser.QueryMatch): { [key: string]: string } {
			const parameterComments: { [key: string]: string } = {};
			const parameterList = match.captures.find(capture => capture.name === 'parameters')?.node;
			if (parameterList) {
					const parameterNodes = parameterList.children.filter(child => child.type === 'parameter');
					for (const parameterNode of parameterNodes) {
							const parameterName = parameterNode.children.find(child => child.type === 'identifier')?.text;
							const commentNode = parameterNode.previousSibling;
							if (parameterName && commentNode && commentNode.type === 'comment') {
									parameterComments[parameterName] = commentNode.text;
							}
					}
			}
			return parameterComments;
	}
}


export interface MethodInfo {
	attributes: string[];
	modifiers: string[];
	returnType: string;
	name: string;
	parameters: ParameterInfo[];
	body: string;
	methodComment: string;
	parameterComments: { [key: string]: string };
}

export interface ParameterInfo {
	type: string;
	name: string;
}
