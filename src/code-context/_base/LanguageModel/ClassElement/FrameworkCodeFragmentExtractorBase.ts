import { ElementBase } from 'src/code-context/_base/LanguageModel/ClassElement/ElementBase';
import { SyntaxNode } from 'web-tree-sitter';

import { IDataStorage } from 'base/common/workspace/WorkspaceService';

type DocDealCallback = (result: string) => string;
export abstract class FrameworkCodeFragmentExtractorBase {
	public static readonly LanguageSupport: Set<string> = new Set<string>(['csharp']);
	protected frameworkCodeFragmentNode: SyntaxNode;
	protected filePath: string;
	constructor(frameworkCodeFragmentNode: SyntaxNode, filePath: string) {
		this.frameworkCodeFragmentNode = frameworkCodeFragmentNode;
		this.filePath = filePath;
	}
	public abstract ExtractFrameworkCodeFragment(): FrameworkCodeFragment;
}

export class FrameworkCodeFragment  implements IDataStorage {
  id:number = -1;
	doc: string = '';
	code: string = '';
	codeContext: string = '';
	filePath: string = '';
	public constructor(
		frameworkCodeFragmentNode: SyntaxNode,
		code: string,
		codeContext: string,
		filePath: string,
		docDealCallback?: DocDealCallback,
	) {
		this.codeContext = codeContext;
		if (frameworkCodeFragmentNode.previousSibling) {
			let dataTemp= this.Getcommits(frameworkCodeFragmentNode.previousSibling, []);
			if (docDealCallback == undefined) {

				this.doc =dataTemp.toString();
			} else {
				let dataTemp1=dataTemp.reverse();
				this.doc = docDealCallback(dataTemp1.toString());
			}
		} else {
			this.doc = '';
		}

		this.code = code;
		this.filePath = filePath;
	}
	equals(other: FrameworkCodeFragment): boolean {
		// if (!(other instanceof FrameworkCodeFragment)) {
		// 	return false;
		// }
		if (other.code === this.code && other.filePath === this.filePath) {
			return true;
		}

		return false;
	}
	GetType(): string {
		return FrameworkCodeFragment.name.toString();
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
	public static DeserializationFormJson(data: any): FrameworkCodeFragment {
		let frameworkCodeFragment = new FrameworkCodeFragment(data.code, data.code, data.codeContext, data.filePath);
		frameworkCodeFragment.code = data.code;
		frameworkCodeFragment.doc = data.doc;
		frameworkCodeFragment.filePath = data.filePath;
		frameworkCodeFragment.codeContext = data.codeContext;
		return frameworkCodeFragment;
	}
	public static DeserializationFormSql(data: any): FrameworkCodeFragment {
		let frameworkCodeFragment = new FrameworkCodeFragment(data.code, data.code, data.codeContext, data.filePath);
		frameworkCodeFragment.code = data.code;
		frameworkCodeFragment.doc = data.doc;
		frameworkCodeFragment.filePath = data.filePath;
		frameworkCodeFragment.codeContext = data.codeContext;
		frameworkCodeFragment.id = data.id;
		return frameworkCodeFragment;
	}
}
