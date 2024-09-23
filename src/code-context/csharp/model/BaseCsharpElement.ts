import Parser from 'web-tree-sitter';

export abstract class BaseCsharpElement {

	public constructor() {}
	protected Getcommits(node: Parser.SyntaxNode, commits: string[]): string[] {
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
