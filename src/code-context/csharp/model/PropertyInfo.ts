
import { PropertyInfoBase } from "src/code-context/_base/LanguageModel/ClassElement/PropertyInfoBase";
import Parser from "web-tree-sitter";
export class PropertyInfo extends PropertyInfoBase {

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

	public constructor(propertyNode: Parser.SyntaxNode) {
		super(propertyNode);
		this.type = this.getPropertyType(propertyNode);
		this.name = this.getPropertyName(propertyNode);
		this.doc = this.getPropertyDoc(propertyNode);
		this.accessModifier = this.getPropertyAccessModifier(propertyNode);
		const modifierGetAndSet = this.getPropertyAccessModifier_getOrSet(propertyNode);
		this.modifier_get = modifierGetAndSet[0];
		this.modifier_set = modifierGetAndSet[1];
	}
	// 获取属性的 XML 注释
	protected override getPropertyDoc(propertyNode: Parser.SyntaxNode): string {
		const xmlDocNode = propertyNode.previousSibling;
		if (xmlDocNode && xmlDocNode.type === 'comment') {
			const commits: string[] = [];
			this.Getcommits(xmlDocNode, commits);
			return commits.toString();
		}
		return '';
	}

	// 获取属性名称
	protected override	getPropertyName(propertyNode: Parser.SyntaxNode): string {
		const variableNode = propertyNode.children.find(item => {
			return item.type == 'identifier';
		});

		if (variableNode) {
			return variableNode ? variableNode.text : '';
		}
		return '';
	}

	// 获取属性类型
	protected override getPropertyType(propertyNode: Parser.SyntaxNode): string {
		const typeNode = propertyNode.children.find(item => {
			return item.type == 'qualified_name';
		});
		return typeNode ? typeNode.text : '';
	}

	// 获取属性访问修饰符
	protected override getPropertyAccessModifier(propertyNode: Parser.SyntaxNode): string[] {
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
	protected override getPropertyAccessModifier_getOrSet(propertyNode: Parser.SyntaxNode): string[] {
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
		if (accessModifier_get != undefined)
			{
				if (accessModifier_get.previousSibling != null)
				{
					accessModifiers[0] = accessModifier_get.previousSibling.text;
				}else
				{
					if (this.accessModifier.length > 0)
					accessModifiers[0] = this.accessModifier[0]
				}

			}
			if (accessModifier_set != undefined)
				{
					if (accessModifier_set.previousSibling != null)
					{
						accessModifiers[1] = accessModifier_set.previousSibling.text;
					}else
					{
						if (this.accessModifier.length > 0)
						accessModifiers[1] = this.accessModifier[0]
					}

				}
		return accessModifiers;
	}
}
