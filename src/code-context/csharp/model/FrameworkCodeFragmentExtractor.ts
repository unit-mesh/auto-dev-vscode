import { SyntaxNode } from 'web-tree-sitter';

import { IDataStorage } from 'base/common/workspace/WorkspaceService';

import { BaseCsharpElement } from './BaseCsharpElement';

type DocDealCallback = (result: string) => string;
export class FrameworkCodeFragmentExtractor {
	private frameworkCodeFragmentNode: SyntaxNode;
	private filePath: string;
	constructor(frameworkCodeFragmentNode: SyntaxNode, filePath: string) {
		this.frameworkCodeFragmentNode = frameworkCodeFragmentNode;
		this.filePath = filePath;
	}
	public ExtractFrameworkCodeFragment(): FrameworkCodeFragment {
		let context: string = '';
		let code: string = this.frameworkCodeFragmentNode.text;
		if (this.frameworkCodeFragmentNode.type === 'class_declaration') {
		} else if (this.frameworkCodeFragmentNode.type === 'method_declaration') {
		}
		return new FrameworkCodeFragment(this.frameworkCodeFragmentNode, context, code, this.filePath, (doc: string) => {
			let match = /<summary>(.*?)<\/summary>/g;
			let matchResult=  match.exec(doc)
			if (matchResult) {
				return matchResult[0];
			}
			return '';
		});
	}
}

export class FrameworkCodeFragment extends BaseCsharpElement implements IDataStorage {
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
		if (frameworkCodeFragmentNode.previousSibling) {
			this.doc = docDealCallback(this.Getcommits(frameworkCodeFragmentNode.previousSibling, []).reverse().toString());
		} else {
			this.doc = '';
		}

		this.context = context;
		this.code = code;
		this.filePath = filePath;
	}
	equals(other: FrameworkCodeFragment): boolean {
		if (
			other.code === this.code &&
			other.doc === this.doc &&
			other.context === this.context &&
			other.filePath === this.filePath
		) {
			return true;
		}

		return false;
	}
	GetType(): string {
		return FrameworkCodeFragment.name.toString();
	}
	Save(): void {
		throw new Error('Method not implemented.');
	}
	Load(): void {
		throw new Error('Method not implemented.');
	}
}
