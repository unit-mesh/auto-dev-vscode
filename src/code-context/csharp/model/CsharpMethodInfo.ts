import Parser from "web-tree-sitter";
import { IParameterInfo, MethodInfoBase } from "src/code-context/_base/LanguageModel/ClassElement/MethodInfoBase";

export class CsharpMethodInfo extends MethodInfoBase {

	modifiers: string[] = [];
	returnType : string= "";

	public constructor(methodNode: Parser.SyntaxNode) {
		super(methodNode);

		const methodXmlDocTeam = this.getMethodXmlDocTeam(methodNode);
		if (methodXmlDocTeam.length > 0) {
		  		this.returnDoc=methodXmlDocTeam[0].includes('<return>')?methodXmlDocTeam[0]:''
		}else
		{
			this.returnDoc=''
		}

		const methodNameAndReturnType = this.getMethodNameAndReturnType(methodNode);
		this.parameters = this.getMethodParameters(methodNode, methodXmlDocTeam);
		this.modifiers = this.getMethodAccessModifier(methodNode);
		this.name = methodNameAndReturnType[0];
		this.returnType = methodNameAndReturnType[1];
		this.methodDoc = methodXmlDocTeam.reverse().toString();
		this.code=methodNode.text;
	}
	protected override getMethodDoc(): string {
		return this.getMethodXmlDocTeam(this.node).reverse().toString();

	}
	protected override getParameters(): IParameterInfo[] {
		return this.getMethodParameters(this.node, this.getMethodXmlDocTeam(this.node));

	}
	protected override getName(): string {
		return this.getMethodNameAndReturnType(this.node)[0];
	}

	// 获取方法的 XML 注释
	getMethodXmlDocTeam(methodNode: Parser.SyntaxNode): string[] {
		const xmlDocNode = methodNode.previousSibling;
		if (xmlDocNode && xmlDocNode.type === 'comment') {
			const commits: string[] = [];
			this.Getcommits(xmlDocNode, commits);
			return commits;
		}
		return [];
	}

	// 获取方法访问修饰符
	getMethodAccessModifier(methodNode: Parser.SyntaxNode): string[] {
		const modifierNodes = methodNode.children.filter(item => {
			return item.type == 'modifier';
		});
		const modifiers: string[] = [];
		if (modifierNodes) {
			for (const item of modifierNodes) {
				modifiers.push(item.text);
			}
			return modifiers;
		}
		return modifiers;
	}

	// 获取方法名称
	getMethodNameAndReturnType(methodNode: Parser.SyntaxNode): string[] {
		const modifierNodes = methodNode.children.filter(item => {
			return item.type == 'identifier';
		});
		const identifiers: string[] = [];
		if (modifierNodes) {
			for (const item of modifierNodes) {
				identifiers.push(item.text);
			}
			if (identifiers.length < 2) {
				identifiers.push('void');
				identifiers.reverse();
			}
			return identifiers;
		}

		return identifiers;
	}
	// 获取方法参数
	getMethodParameters(methodNode: Parser.SyntaxNode, methoddocTeam: string[]): IParameterInfo[] {
		const parameterListNode = methodNode.children.find(item => {
			return item.type == 'parameter_list';
		});
		const parameterInfos: IParameterInfo[] = [];
		if (parameterListNode) {
			const parameterNodes = parameterListNode.children.filter(item => {
				return item.type == 'parameter';
			});
			for (const item of parameterNodes) {
				const identifiers = item.children.filter(item => {
					return item.type == 'identifier';
				});

				const paramDoc = methoddocTeam.find(item => item.includes(identifiers[1].text));
				const param = {
					type: identifiers[0].text,
					name: identifiers[1].text,
					doc: paramDoc,
				};
				parameterInfos.push(param);
			}
		}
		return parameterInfos;
	}
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


}

