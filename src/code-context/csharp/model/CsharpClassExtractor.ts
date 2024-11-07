import { ClassExtractorBase } from 'src/code-context/_base/LanguageModel/ClassElement/ClassExtractorBase';
import { ClassInfoBase } from 'src/code-context/_base/LanguageModel/ClassElement/ClassInfoBase';
import { FieldInfoBase } from 'src/code-context/_base/LanguageModel/ClassElement/FieldInfoBase';
import { MethodInfoBase } from 'src/code-context/_base/LanguageModel/ClassElement/MethodInfoBase';
import { FieldInfoFactory } from 'src/code-context/_base/LanguageModel/ClassELementFactory/FieldInfoFactory';
import { MethodInfoFactory } from 'src/code-context/_base/LanguageModel/ClassELementFactory/MethodInfoFactory';
import { l10n } from 'vscode';
import vscode from 'vscode';
import Parser, { SyntaxNode } from 'web-tree-sitter';

import { CsharpFieldInfo } from './CsharpFieldInfo';
import { CsharpMethodInfo } from './CsharpMethodInfo';
import { PropertyInfo } from './PropertyInfo';

export class CsharpClassExtractor extends ClassExtractorBase {
	constructor(classNode: SyntaxNode) {
		super(classNode);
	}

	public ExtractClass(): CsharpClassInfo | null {
		return this.traverse(this.classNode);
	}

	protected traverse(classNode: Parser.SyntaxNode): CsharpClassInfo {
		const methodInfos: CsharpMethodInfo[] = [];
		const propertyInfos: PropertyInfo[] = [];
		const fieldInfos: FieldInfoBase[] = [];
		let className: string = '';
		let interfaces: string[] = [];
		let fatherClassName: string = '';
		let classXmlDoc = '';
		let modifiers: string = '';
		let limitList: string[] = [];
		if (classNode.type === 'class_declaration') {
			classXmlDoc = this.getClassDoc(classNode);

			let editor = vscode.window.activeTextEditor;
			for (const child of classNode.children) {
				switch (child.type) {
					case 'base_list':
						let regex = /^[A-Za-z]+$/;
						//todo: interfaces limit
						// let limitNode = child.children.find(child => child.type === 'generic_name');
						// if (limitNode) {
						// 	interfaces.push(limitNode.children[0].text);


						// }
						for (let i = 1; i < child.children.length; i++) {
							if (i == 1) {
								fatherClassName = child.children[i].text;
							} else {
								if (regex.test(child.children[i].text)) {
									interfaces.push(child.children[i].text);
								}
							}
						}
						break;
					case 'identifier':
						if (className == '') {
							className = child.text;
						}
						break;
					case 'modifier':
						modifiers = child.text;
						break;
					case 'declaration_list':
						for (const childLevel1 of child.children) {
							if (childLevel1.type === 'field_declaration') {
								if (editor) {
									let language = editor.document.languageId;
									const fieldInfo = FieldInfoFactory.createInstance(language, childLevel1) as CsharpFieldInfo;
									fieldInfos.push(fieldInfo);
								}
							} else if (childLevel1.type === 'method_declaration') {
								if (editor) {
									const methodInfo: CsharpMethodInfo = MethodInfoFactory.createInstance(
										editor.document.languageId,
										childLevel1,
									) as CsharpMethodInfo;
									methodInfos.push(methodInfo);
								}
							} else if (childLevel1.type === 'property_declaration') {
								const propertyInfo: PropertyInfo = new PropertyInfo(childLevel1);
								propertyInfos.push(propertyInfo);
							}
						}
				}
			}
		}
		const classInfo = new CsharpClassInfo(
			modifiers,
			className,
			fatherClassName,
			interfaces,
			limitList,
			classXmlDoc,
			fieldInfos,
			methodInfos,
			propertyInfos,
		);
		return classInfo;
	}

	// 获取类的 XML 注释
	protected getClassDoc(classNode: Parser.SyntaxNode): string {
		const xmlDocNode = classNode.previousSibling;
		if (xmlDocNode && xmlDocNode.type === 'comment') {
			const commits: string[] = [];
			this.getcommits(xmlDocNode, commits);
			return commits.toString();
		}
		return '';
	}

	protected getcommits(node: Parser.SyntaxNode, commits: string[]): string[] {
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
	protected getClassName(node: Parser.SyntaxNode): string {
		if (node.type === 'identifier') {
			return node.text;
		}
		return '';
	}
	protected getFatherClassName(node: Parser.SyntaxNode): string {
		if (node.type === 'base_list') {
			return node.text;
		}
		return '';
	}
}
export class CsharpClassInfo extends ClassInfoBase {
	propertyInfos?: PropertyInfo[];
	modifiers: string;
	interfaces?: string[];
	limitList?: string[];
	constructor(
		modifiers: string,
		className: string,
		fatherName?: string,
		interfaces?: string[],
		limitList?: string[],
		xmlDoc?: string,
		fields?: FieldInfoBase[],
		methods?: MethodInfoBase[],
		propertyInfos?: PropertyInfo[],
	) {
		super(className, fatherName, xmlDoc, fields, methods);
		this.propertyInfos = propertyInfos;
		this.modifiers = modifiers;
		this.interfaces = interfaces;
		this.limitList = limitList;
	}
}
