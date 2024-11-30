
import Parser, { SyntaxNode } from 'web-tree-sitter';
import { ClassInfoBase } from './ClassInfoBase';
export abstract class ClassExtractorBase {
	protected classNode: SyntaxNode;
	public constructor(classNode: SyntaxNode) {
   this.classNode=classNode;
	}
	public abstract ExtractClass(): ClassInfoBase | null;
	protected abstract traverse(classNode: Parser.SyntaxNode): ClassInfoBase;
	protected abstract getClassDoc(classNode: Parser.SyntaxNode): string;
	protected abstract getcommits(node: Parser.SyntaxNode, commits: string[]): string[];
	protected abstract getClassName(node: Parser.SyntaxNode): string;
	protected abstract getFatherClassName(node: Parser.SyntaxNode): string ;


}
