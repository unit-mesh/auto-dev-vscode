import Parser from 'web-tree-sitter';

export abstract class ElementBase {
	protected node: Parser.SyntaxNode;
	protected code:string;
	public constructor(node: Parser.SyntaxNode) {
		this.node = node;
		this.code = node.text;
	}
	protected abstract Getcommits(node: Parser.SyntaxNode, commits: string[]): string[];
}
