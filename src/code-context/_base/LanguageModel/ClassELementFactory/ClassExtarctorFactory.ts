import { SyntaxNode } from "web-tree-sitter";
import { ClassExtractorBase } from "../ClassElement/ClassExtractorBase";

export class ClassExtractorFactory {
	private static classMap = new Map<string, new (classNode: SyntaxNode) => ClassExtractorBase>();

	// 注册类
	static registerClass(language: string, classConstructor: new (classNode: SyntaxNode) => ClassExtractorBase) {
			this.classMap.set(language, classConstructor);
	}

	// 创建实例
	static createInstance(language: string, classNode: SyntaxNode): ClassExtractorBase {
			const ClassConstructor = this.classMap.get(language);
			if (ClassConstructor) {
					return new ClassConstructor(classNode);
			} else {
					throw new Error(`Unknown class: ${language}`);
			}
	}
	static IsSupportLanguage(language: string): boolean {
			return this.classMap.has(language);
	}
}
