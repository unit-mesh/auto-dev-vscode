import { SyntaxNode } from 'web-tree-sitter';

import { ClassExtractorBase } from '../ClassElement/ClassExtractorBase';
import { FieldInfoBase } from '../ClassElement/FieldInfoBase';

export class FieldInfoFactory {
	private static fieldInfoMap = new Map<string, new (classNode: SyntaxNode) => FieldInfoBase>();

	// 注册类
	static registerClass(language: string, classConstructor: new (classNode: SyntaxNode) => FieldInfoBase) {
		this.fieldInfoMap.set(language, classConstructor);
	}

	// 创建实例
	static createInstance(language: string, classNode: SyntaxNode): FieldInfoBase {
		const ClassConstructor = this.fieldInfoMap.get(language);
		if (ClassConstructor) {
			return new ClassConstructor(classNode);
		} else {
			throw new Error(`Unknown class: ${language}`);
		}
	}
	static IsSupportLanguage(language: string): boolean {
		return this.fieldInfoMap.has(language);
	}
}
