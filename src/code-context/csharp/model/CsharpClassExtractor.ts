import { l10n } from 'vscode';
import Parser, { SyntaxNode } from 'web-tree-sitter';

import { FieldInfo } from './FieldInfo';
import { MethodInfo } from './MethodInfo';
import { PropertyInfo } from './PropertyInfo';

export class CsharpClassExtractor {
	private classNode: SyntaxNode;

	constructor(classNode: SyntaxNode) {
		this.classNode = classNode;
	}

	public ExtractClass(): ClassInfo | null {
		return this.traverse(this.classNode);
	}

	private traverse(classNode: Parser.SyntaxNode): ClassInfo {
		const methodInfos: MethodInfo[] = [];
		const propertyInfos: PropertyInfo[] = [];
		const fieldInfos: FieldInfo[] = [];
		let className: string = '';
		let fatherClassName: string = '';
		let classXmlDoc = '';
		if (classNode.type === 'class_declaration') {
			classXmlDoc = this.getClassXmlDoc(classNode);
			className = this.getClassName(classNode);
			fatherClassName = this.getFatherClassName(classNode);
			for (const child of classNode.children) {
				if (child.type === 'declaration_list') {
					for (const childLevel1 of child.children) {
						if (childLevel1.type === 'field_declaration') {
							const fieldInfo: FieldInfo = new FieldInfo(childLevel1);
							fieldInfos.push(fieldInfo);
						} else if (childLevel1.type === 'method_declaration') {
							const methodInfo: MethodInfo = new MethodInfo(childLevel1);
							methodInfos.push(methodInfo);
						} else if (childLevel1.type === 'property_declaration') {
							const propertyInfo: PropertyInfo = new PropertyInfo(childLevel1);
							propertyInfos.push(propertyInfo);
						}
					}
				}
			}
		}
		const classInfo = new ClassInfo(className, fatherClassName, classXmlDoc, fieldInfos, methodInfos, propertyInfos);
		return classInfo;
	}

	// 获取类的 XML 注释
	private getClassXmlDoc(classNode: Parser.SyntaxNode): string {
		const xmlDocNode = classNode.previousSibling;
		if (xmlDocNode && xmlDocNode.type === 'comment') {
			const commits: string[] = [];
			this.getcommits(xmlDocNode, commits);
			return commits.toString();
		}
		return '';
	}

	private getcommits(node: Parser.SyntaxNode, commits: string[]): string[] {
		if (node.type === 'comment') {
			commits.push(node.text);
			if (node.previousSibling) {
				return this.getcommits(node.previousSibling, commits);
			} else {
				return commits;
			}
		} else {
			return commits;
		}
	}
	private getClassName(node: Parser.SyntaxNode): string {
		if (node.type === 'identifier') {
			return node.text;
		}
		return '';
	}
	private getFatherClassName(node: Parser.SyntaxNode): string {
		if (node.type === 'base_list') {
			return node.text;
		}
		return '';
	}
}
export class ClassInfo {
	name: string;
	fatherName?: string;
	xmlDoc?: string;
	fields?: FieldInfo[];
	unfinishedMethods?: MethodInfo[];
	completedMethods?: MethodInfo[];
	propertyInfos?: PropertyInfo[];
	constructor(
		className: string,
		fatherName?: string,
		xmlDoc?: string,
		fields?: FieldInfo[],
		methods?: MethodInfo[],
		propertyInfos?: PropertyInfo[],
	) {
		this.name = className;
		this.fatherName = fatherName;
		this.fields = fields;
		this.propertyInfos = propertyInfos;
		this.xmlDoc = xmlDoc;
		this.unfinishedMethods = [];
		this.completedMethods = [];
		if (methods) {
			for (let item of methods) {
				if(item.methodXmlDoc.includes(l10n.t('Not Completed')))
				{
					this.unfinishedMethods.push(item);
				}else
				{
					this.completedMethods.push(item);
				}
			}
		}

	}
}
