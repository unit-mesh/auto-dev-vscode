import { is } from 'node_modules/cheerio/dist/commonjs/api/traversing';
import { ElementBase } from 'src/code-context/_base/LanguageModel/ClassElement/ElementBase';
import { Point, SyntaxNode } from 'web-tree-sitter';

import { IDataStorage } from 'base/common/workspace/WorkspaceService';

type DocDealCallback = (result: string) => string;
export abstract class FrameworkCodeFragmentExtractorBase {
	public static readonly LanguageSupport: Set<string> = new Set<string>(['csharp']);
	protected frameworkCodeFragmentNode: SyntaxNode;
	protected filePath: string;
	constructor(frameworkCodeFragmentNode: SyntaxNode, filePath: string) {
		this.frameworkCodeFragmentNode = frameworkCodeFragmentNode;
		this.filePath = filePath;
	}
	public abstract ExtractFrameworkCodeFragment(): FrameworkCodeFragment;
}

export class FrameworkCodeFragment implements IDataStorage {
	id: number = -1;
	doc: string = '';
	code: string = '';
	codeContext: string = '';
	filePath: string = '';
	public constructor(
		frameworkCodeFragmentNode: SyntaxNode,
		code: string,
		codeContext: string,
		filePath: string,
		docDealCallback?: DocDealCallback,
	) {
		this.codeContext = codeContext;
		if (frameworkCodeFragmentNode.previousSibling) {
			let dataTemp = this.Getcommits(frameworkCodeFragmentNode.previousSibling, []);
			if (docDealCallback == undefined) {
				this.doc = dataTemp.toString();
			} else {
				let dataTemp1 = dataTemp.reverse();
				this.doc = docDealCallback(dataTemp1.toString());
			}
		} else {
			this.doc = '';
		}

		if (frameworkCodeFragmentNode.type == 'class_declaration') {
			let root = frameworkCodeFragmentNode.tree.rootNode;
			let needDeleteNodes: SyntaxNode[] = [];
			for (let i = 0; i < root.children.length; i++) {
				switch (root.children[i].type) {
					case 'using_directive':
						needDeleteNodes.push(root.children[i]);
						break;
					case 'declaration_list':
						let declarationList = root.children[i];
						let commitNodes: SyntaxNode[] = [];
						for (let j = 0; j < declarationList.children.length; j++) {
							if (declarationList.children[j].type == 'comment') {
								commitNodes.push(declarationList.children[j]);
							}
							if (declarationList.children[j].type == 'class_declaration') {
								if (declarationList.children[j] != frameworkCodeFragmentNode) {
									needDeleteNodes.concat(commitNodes);
									needDeleteNodes.push(declarationList.children[j]);
									commitNodes = [];
								}
							}
						}
						break;
					case 'namespace_declaration':
						for (let j = 0; j < root.children[i].children.length; j++) {
							if (root.children[i].children[j].type == 'declaration_list') {
								let declarationList = root.children[i].children[j];
								let commitNodes: SyntaxNode[] = [];
								for (let k = 0; k < declarationList.children.length; k++) {
									if (declarationList.children[k].type == 'comment') {
										commitNodes.push(declarationList.children[k]);
									}
									if (declarationList.children[k].type == 'class_declaration') {
										if (declarationList.children[k].text != frameworkCodeFragmentNode.text) {
											needDeleteNodes.concat(commitNodes);
											needDeleteNodes.push(declarationList.children[k]);
											commitNodes = [];
										}
									}
								}
							}
						}

						let codeTemp = frameworkCodeFragmentNode.text;
						for (let i = 0; i < frameworkCodeFragmentNode.children.length; i++) {
							if (frameworkCodeFragmentNode.children[i].type == 'declaration_list') {
								let declarationList = frameworkCodeFragmentNode.children[i];
								for (let j = 0; j < declarationList.children.length; j++) {
									if (
										declarationList.children[j].type == 'method_declaration' ||
										declarationList.children[j].type == 'field_declaration' ||
										declarationList.children[j].type == 'constructor_declaration'
									) {
										let node = declarationList.children[j];
										let block: SyntaxNode | undefined = undefined;
										let isPublic = false;
										for (let k = 0; k < node.children.length; k++) {
											let nodeChild = node.children[k];
											if (nodeChild.type == 'modifier') {
												if (nodeChild.text != 'public') {
													isPublic = false;
													codeTemp = codeTemp.replace(node.text, '');
												} else {
													isPublic = true;
												}
											}
											if (nodeChild.type == 'block' && isPublic) {
												block = node.children[k];
											}
										}
										if (!isPublic) {
											let previousSibling = node.previousSibling;
											while (previousSibling) {
												if (previousSibling.type == 'comment') {
													needDeleteNodes.push(previousSibling);
													previousSibling = previousSibling.previousSibling;
												} else {
													break;
												}
											}
											needDeleteNodes.push(node);
										} else if (block) {
											needDeleteNodes.push(block);
										}
									}
								}
							}
						}

						needDeleteNodes.sort((a, b) => a.startIndex - b.startIndex);
						let newString = frameworkCodeFragmentNode.text;

						// 计算删除范围并删除节点内容
						let treeSitterContentModifier = new TreeSitterContentModifier(frameworkCodeFragmentNode.tree.rootNode);
						let result = treeSitterContentModifier.removeChildContent(needDeleteNodes);
						console.log(result);
						this.code = result;
				}
			}
		} else {
			this.code = code;
		}
		this.filePath = filePath;
	}
	equals(other: FrameworkCodeFragment): boolean {
		// if (!(other instanceof FrameworkCodeFragment)) {
		// 	return false;
		// }
		if (other.code === this.code && other.filePath === this.filePath) {
			return true;
		}

		return false;
	}
	GetType(): string {
		return FrameworkCodeFragment.name.toString();
	}
	protected Getcommits(node: SyntaxNode, commits: string[]): string[] {
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
	public static DeserializationFormJson(data: any): FrameworkCodeFragment {
		let frameworkCodeFragment = new FrameworkCodeFragment(data.code, data.code, data.codeContext, data.filePath);
		frameworkCodeFragment.code = data.code;
		frameworkCodeFragment.doc = data.doc;
		frameworkCodeFragment.filePath = data.filePath;
		frameworkCodeFragment.codeContext = data.codeContext;
		return frameworkCodeFragment;
	}
	public static DeserializationFormSql(data: any): FrameworkCodeFragment {
		let frameworkCodeFragment = new FrameworkCodeFragment(data.code, data.code, data.codeContext, data.filePath);
		frameworkCodeFragment.code = data.code;
		frameworkCodeFragment.doc = data.doc;
		frameworkCodeFragment.filePath = data.filePath;
		frameworkCodeFragment.codeContext = data.codeContext;
		frameworkCodeFragment.id = data.id;
		return frameworkCodeFragment;
	}
}
class TreeSitterContentModifier {
	private root: SyntaxNode;

	constructor(root: SyntaxNode) {
		this.root = root;
	}

	public removeChildContent(children: SyntaxNode[]): string {
		let rootContent = this.root.text;
		// 对子节点按 startIndex 进行排序，确保从后往前移除内容
		children.sort((a, b) => b.startIndex - a.startIndex);

		// 从后往前移除子节点的内容
		for (let i = 0; i < children.length; i++) {
			let startIndex = children[i].startIndex;
			let endIndex =  children[i].endIndex;
			let endNote = rootContent.charAt(endIndex - i);
			let startNote = rootContent.charAt(startIndex - i);
            while (endIndex < rootContent.length && /\s/.test(rootContent[endIndex])) {
                endIndex++;
            }
		// 一次性删除计算出的完整范围
			rootContent = rootContent.slice(0, startIndex) + rootContent.slice(endIndex);
		}
		return rootContent;
	}

}
