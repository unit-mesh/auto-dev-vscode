import { SyntaxNode } from 'web-tree-sitter';

import { ElementBase } from '../../_base/LanguageModel/ClassElement/ElementBase';

type DocDealCallback = (result: string) => string;
export class CodeSampleExtractor {
	private codeSampleNode: SyntaxNode;
	private filePath: string;
	constructor(codeSampleNode: SyntaxNode, filePath: string) {
		this.codeSampleNode = codeSampleNode;
		this.filePath = filePath;
	}
	public ExtractCodeSample(): CodeSample {
		let context: string = '';
		let code: string = this.codeSampleNode.text;
		if (this.codeSampleNode.type === 'class_declaration') {

		} else if (this.codeSampleNode.type === 'method_declaration') {
		}
		return new CodeSample(this.codeSampleNode, context, code, this.filePath, (doc: string) => {
			let match = doc.match('<summary>(.*?)</summary>/g');
			if (match) {
				if (match.groups) {
					return match.groups[0];
				}
			}
			return '';
		});
	}
}

export class CodeSample extends ElementBase {
	doc: string;
	context: string;
	code: string;
	filePath: string;
	public constructor(
		frameworkCodeFragmentNode: SyntaxNode,
		context: string,
		code: string,
		filePath: string,
		docDealCallback: DocDealCallback,
	) {
		super(frameworkCodeFragmentNode);
		this.doc = docDealCallback(this.Getcommits(frameworkCodeFragmentNode, []).toString());
		this.context = context;
		this.code = code;
		this.filePath = filePath;
	}
	protected Getcommits(node: SyntaxNode, commits: string[]): string[] {
		if (node.type === 'comment') {
			commits.push(node.text);
			if (node.previousSibling) {
				return this.Getcommits(node.previousSibling, commits);
			} else {
				return commits;
			}
		} else {
			return commits;
		}
	}
}
