import { SyntaxNode } from "web-tree-sitter";
import { MethodInfoBase } from "../ClassElement/MethodInfoBase";

export class MethodInfoFactory {
	private static methodInfoMap = new Map<string, new (classNode: SyntaxNode) => MethodInfoBase>();

	// 注册类
	static registerClass(language: string, classConstructor: new (classNode: SyntaxNode) => MethodInfoBase) {
			this.methodInfoMap.set(language, classConstructor);
	}

	// 创建实例
	static createInstance(language: string, classNode: SyntaxNode): MethodInfoBase {
			const ClassConstructor = this.methodInfoMap.get(language);
			if (ClassConstructor) {
					return new ClassConstructor(classNode);
			} else {
					throw new Error(`Unknown class: ${language}`);
			}
	}
	static IsSupportLanguage(language: string): boolean {
		return this.methodInfoMap.has(language);
}
}
