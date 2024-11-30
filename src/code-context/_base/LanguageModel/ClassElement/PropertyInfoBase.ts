import Parser from 'web-tree-sitter';

import { ElementBase } from './ElementBase';

export abstract class PropertyInfoBase extends ElementBase {
	type: string='';
	name: string = '';
	doc: string = '';
	accessModifier: string[] = [];
	modifier_get: string = '';
	modifier_set: string = '';
	public constructor(
		methodNode: Parser.SyntaxNode
	) {
		super(methodNode);

	}
	// 获取属性名注释说明
	protected abstract getPropertyDoc(propertyNode: Parser.SyntaxNode): string;
	// 获取属性名称
	protected abstract getPropertyName(propertyNode: Parser.SyntaxNode): string;
	// 获取属性类型
	protected abstract getPropertyType(propertyNode: Parser.SyntaxNode): string;
	// 获取属性访问修饰符
	protected abstract getPropertyAccessModifier(propertyNode: Parser.SyntaxNode): string[];
	// 获取属性读写权限符
	protected abstract getPropertyAccessModifier_getOrSet(propertyNode: Parser.SyntaxNode): string[];
}
