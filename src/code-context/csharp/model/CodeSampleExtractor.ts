import { SyntaxNode } from 'web-tree-sitter';

import { BaseCsharpElement } from './BaseCsharpElement';

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

export class CodeSample extends BaseCsharpElement {
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
		super();
		this.doc = docDealCallback(this.Getcommits(frameworkCodeFragmentNode, []).toString());
		this.context = context;
		this.code = code;
		this.filePath = filePath;
	}
}
