

import Parser from "web-tree-sitter";
import { BaseCsharpElement } from "./BaseCsharpElement";
export class FieldInfo extends BaseCsharpElement {
	type: string;
	name: string;
	accessModifier?: string[];
	doc?: string;
	public constructor(fieldNode: Parser.SyntaxNode) {
		super();
		this.doc = this.getFieldXmlDoc(fieldNode);
		this.accessModifier = this.getFieldAccessModifier(fieldNode);
		this.type = this.getFieldType(fieldNode);
		this.name = this.getFieldName(fieldNode);
	}

	// 获取字段的 XML 注释

	private getFieldXmlDoc(fieldNode: Parser.SyntaxNode): string {
		const xmlDocNode = fieldNode.previousSibling;
		if (xmlDocNode && xmlDocNode.type === 'comment') {
			const commits: string[] = [];
			this.Getcommits(xmlDocNode, commits);
			return commits.toString();
		}
		return '';
	}

	// 获取字段名称
	getFieldName(fieldNode: Parser.SyntaxNode): string {
		const variableNode = fieldNode.children.find(item => {
			return item.type == 'variable_declaration';
		});
		if (variableNode == null) return '';
		const variableDeclaratorNode = variableNode.children.find(item => {
			return item.type == 'variable_declarator';
		});
		if (variableDeclaratorNode == null) return '';
		const fieldNameNode = variableDeclaratorNode.children.find(item => {
			return item.type == 'identifier';
		});
		if (fieldNameNode) {
			return fieldNameNode ? fieldNameNode.text : '';
		}
		return '';
	}

	// 获取字段类型
	getFieldType(fieldNode: Parser.SyntaxNode): string {
		const variableNode = fieldNode.children.find(item => {
			return item.type == 'variable_declaration';
		});
		if (variableNode == null) return '';
		let fieldTypeNode = variableNode.children.find(item => {
			return item.type == 'identifier';
		});
		if (fieldTypeNode) {
			return fieldTypeNode ? fieldTypeNode.text : '';
		}else
		{
			fieldTypeNode=variableNode.children.find(item => {
				return item.type == 'predefined_type';
			});
		}
		if (fieldTypeNode) {
			return fieldTypeNode ? fieldTypeNode.text : '';
		}
		return '';
	}

	// 获取字段访问修饰符
	getFieldAccessModifier(fieldNode: Parser.SyntaxNode): string[] {
		const accessModifier: string[] = [];
		const modifierNods = fieldNode.children.filter(item => {
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
}
