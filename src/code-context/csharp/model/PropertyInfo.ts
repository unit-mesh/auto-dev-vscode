
import Parser from "web-tree-sitter";
import { BaseCsharpElement } from "./BaseCsharpElement";
export class PropertyInfo extends BaseCsharpElement {
	type: string;
	name: string;
	doc?: string;
	accessModifier?: string[];
	modifier_get?: string;
	modifier_set?: string;
	public constructor(propertyNode: Parser.SyntaxNode) {
		super();
		this.type = this.getPropertyType(propertyNode);
		this.name = this.getPropertyName(propertyNode);
		this.doc = this.getPropertyXmlDoc(propertyNode);
		this.accessModifier = this.getPropertyAccessModifier(propertyNode);
		const modifierGetAndSet = this.getPropertyAccessModifier_getOrSet(propertyNode);
		this.modifier_get = modifierGetAndSet[0];
		this.modifier_set = modifierGetAndSet[1];
	}
	// 获取属性的 XML 注释
	getPropertyXmlDoc(propertyNode: Parser.SyntaxNode): string {
		const xmlDocNode = propertyNode.previousSibling;
		if (xmlDocNode && xmlDocNode.type === 'comment') {
			const commits: string[] = [];
			this.Getcommits(xmlDocNode, commits);
			return commits.toString();
		}
		return '';
	}

	// 获取属性名称
	getPropertyName(propertyNode: Parser.SyntaxNode): string {
		const variableNode = propertyNode.children.find(item => {
			return item.type == 'identifier';
		});

		if (variableNode) {
			return variableNode ? variableNode.text : '';
		}
		return '';
	}

	// 获取属性类型
	getPropertyType(propertyNode: Parser.SyntaxNode): string {
		const typeNode = propertyNode.children.find(item => {
			return item.type == 'predefined_type';
		});
		if (typeNode) {
			return typeNode ? typeNode.text : '';
		}
		return '';
	}

	// 获取属性访问修饰符
	getPropertyAccessModifier(propertyNode: Parser.SyntaxNode): string[] {
		const accessModifier: string[] = [];
		const modifierNods = propertyNode.children.filter(item => {
			return item.type == 'modifier';
		});

		if (modifierNods.length > 0) {
			for (const item of modifierNods) {
				accessModifier.push(item.text);
			}
			return accessModifier;
		}
		return accessModifier;
	}
	getPropertyAccessModifier_getOrSet(propertyNode: Parser.SyntaxNode): string[] {
		const accessorListNode = propertyNode.children.find(item => {
			return item.type == 'accessor_list';
		});
		const accessModifiers: string[] = ['', ''];
		if (accessorListNode == null) return accessModifiers;
		const accessorNodes = accessorListNode.children.filter(item => {
			return item.type == 'accessor_declaration';
		});
		let accessModifier_get: Parser.SyntaxNode | undefined;
		let accessModifier_set: Parser.SyntaxNode | undefined;
		for (const item of accessorNodes) {
			if (accessModifier_get == undefined) {
				accessModifier_get = item.children.find(item => {
					return item.type == 'get';
				});
			}
			if (accessModifier_set == undefined) {
				accessModifier_set = item.children.find(item => {
					return item.type == 'set';
				});
			}
		}
		if (accessModifier_get == undefined) return accessModifiers;
		if (accessModifier_get.previousSibling == null) return accessModifiers;
		accessModifiers[0] = accessModifier_get.previousSibling?.text;

		if (accessModifier_set == undefined) return accessModifiers;
		if (accessModifier_set.previousSibling == null) return accessModifiers;
		accessModifiers[1] = accessModifier_set.previousSibling?.text;
		return accessModifiers;
	}
}
