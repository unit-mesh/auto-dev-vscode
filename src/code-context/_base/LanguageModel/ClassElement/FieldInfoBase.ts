import Parser from 'web-tree-sitter';

import { ElementBase } from './ElementBase';

export abstract class FieldInfoBase extends ElementBase {
	type: string=	'';
	name: string=	'';
	doc: string=	'';
	modifiers: string[] = [];
	public constructor(methodNode: Parser.SyntaxNode) {
		super(methodNode);
	}

	protected abstract getFieldDoc(fieldNode: Parser.SyntaxNode): string;
	// 获取字段名称
	protected abstract getFieldName(fieldNode: Parser.SyntaxNode): string;
	// 获取字段类型
	protected abstract getFieldType(fieldNode: Parser.SyntaxNode): string;

	// 获取字段访问修饰符
	protected abstract getFieldAccessModifier(fieldNode: Parser.SyntaxNode): string[];
}
