

import { FieldInfoBase } from "src/code-context/_base/LanguageModel/ClassElement/FieldInfoBase";
import Parser from "web-tree-sitter";

export class CsharpFieldInfo extends FieldInfoBase {
	accessModifier: string[];
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

	public constructor(fieldNode: Parser.SyntaxNode) {
		super(fieldNode);
		this.doc = this.getFieldDoc(fieldNode);
		this.accessModifier = this.getFieldAccessModifier(fieldNode);
		this.type = this.getFieldType(fieldNode);
		this.name = this.getFieldName(fieldNode);
	}

	// 获取字段的 XML 注释

   protected override getFieldDoc(fieldNode: Parser.SyntaxNode): string {
		const xmlDocNode = fieldNode.previousSibling;
		if (xmlDocNode && xmlDocNode.type === 'comment') {
			const commits: string[] = [];
			this.Getcommits(xmlDocNode, commits);
			return commits.toString();
		}
		return '';
	}

	// 获取字段名称
	protected override getFieldName(fieldNode: Parser.SyntaxNode): string {
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
	protected override getFieldType(fieldNode: Parser.SyntaxNode): string {
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
				return item.type == 'qualified_name';
			});
		}
		if (fieldTypeNode) {
			return fieldTypeNode ? fieldTypeNode.text : '';
		}
		return '';
	}

	// 获取字段访问修饰符
	protected override getFieldAccessModifier(fieldNode: Parser.SyntaxNode): string[] {
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
