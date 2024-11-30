import { SyntaxNode } from 'web-tree-sitter';
import { FrameworkCodeFragment, FrameworkCodeFragmentExtractorBase } from 'src/code-context/_base/LanguageModel/ClassElement/FrameworkCodeFragmentExtractorBase';


export class CsharpFrameworkCodeFragmentExtractor extends FrameworkCodeFragmentExtractorBase{
	public static readonly LanguageSupport:Set<string>=new Set<string>(["csharp"])
	constructor(frameworkCodeFragmentNode: SyntaxNode, filePath: string) {
		super(frameworkCodeFragmentNode,filePath);

	}
	public ExtractFrameworkCodeFragment(): FrameworkCodeFragment {
		let code: string = this.frameworkCodeFragmentNode.text;
		if (this.frameworkCodeFragmentNode.type === 'class_declaration') {
			return new FrameworkCodeFragment(this.frameworkCodeFragmentNode, code,"", this.filePath);
		}
		return new FrameworkCodeFragment(this.frameworkCodeFragmentNode, code, "",this.filePath, (doc: string) => {
			let match = /<summary>(.*?)<\/summary>/g;
			let matchResult = match.exec(doc);
			if (matchResult) {
				return matchResult[0];
			}
			return '';
		});
	}
}


