import Parser from 'web-tree-sitter';

export abstract class ElementBase {
	protected node: Parser.SyntaxNode;
	public constructor(node: Parser.SyntaxNode) {
		this.node = node;
	}
	protected abstract Getcommits(node: Parser.SyntaxNode, commits: string[]): string[];
}
