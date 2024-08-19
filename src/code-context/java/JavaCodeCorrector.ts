import vscode from 'vscode';

import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { PositionUtil } from '../../editor/ast/PositionUtil';
import { CodeCorrector, CorrectorContext } from '../_base/CodeCorrector';
import { TreeSitterFile } from '../ast/TreeSitterFile';
import { textToTreeSitterFile } from '../ast/TreeSitterWrapper';

export class JavaCodeCorrector implements CodeCorrector {
	constructor(
		private context: CorrectorContext,
		private lsp: ILanguageServiceProvider,
	) {}
/**
 * 修正函数，用于修正Java源代码中的类名和包名。
 *
 * @async
 * @function correct
 * @returns {Promise<void>} 一个Promise对象，表示修正操作的完成。
 *
 * @throws {Error} 如果无法找到tree-sitter文件，则抛出错误。
 *
 * @example
 * try {
 *   await correct();
 *   console.log('修正操作完成');
 * } catch (error) {
 *   console.error('发生错误:', error.message);
 * }
 */
	async correct(): Promise<void> {
		let tsfile = await textToTreeSitterFile(this.context.sourcecode, 'java', this.lsp);

		if (!tsfile) {
			return Promise.reject(`Failed to find tree-sitter file for: ${this.context.document.uri}`);
		}

		await this.fixIncorrectClassName(tsfile, this.context.document);
		await this.fixIncorrectPackageName(tsfile, this.context.document);
	}

	/**
	 * Fix LLM generated test file lost class name issue
	/**
 * 修复不正确的类名
 *
 * @param {TreeSitterFile} tsfile - 包含类定义的 TreeSitter 文件
 * @param {vscode.TextDocument} document - 当前打开的文档
 *
 * @description
 * 此函数用于修复给定 TreeSitter 文件中不正确的类名。它使用查询来查找类定义，
 * 然后将其与目标类名进行比较。如果它们不同，则使用新的目标类名替换当前类名。
 * 修改将应用于给定的文档。
 */
	private async fixIncorrectClassName(tsfile: TreeSitterFile, document: vscode.TextDocument) {
		let query = tsfile.languageProfile.classQuery.query(tsfile.tsLanguage);
		const captures = query!!.captures(tsfile.tree.rootNode);

		const queryCapture = captures.find(c => c.name === 'name.definition.class');
		if (queryCapture) {
			// compare targetClassName to queryCapture.text if they are different, replace queryCapture.text with targetClassName
			let classNode = queryCapture.node;
			if (this.context.targetClassName !== classNode.text) {
				let edit = new vscode.WorkspaceEdit();

				let classNameRange = new vscode.Range(
					PositionUtil.fromNode(classNode.startPosition),
					PositionUtil.fromNode(classNode.endPosition),
				);

				edit.replace(document.uri, classNameRange, this.context.targetClassName);
				// applyEdit
				await vscode.workspace.applyEdit(edit);
			}
		}
	}

	/**
	 * Fix LLM generated test file lost package name issue
	 */
	private async fixIncorrectPackageName(tsfile: TreeSitterFile, document: vscode.TextDocument) {
		let packageQuery = tsfile.languageProfile.packageQuery!!.query(tsfile.tsLanguage);
		const packageCapture = packageQuery!!.captures(tsfile.tree.rootNode);

		// if package is not found, add package to the top of the file
		if (packageCapture.length === 0) {
			let content = 'package ' + this.context.packageName + ';\n\n';

			let edit = new vscode.WorkspaceEdit();
			edit.insert(document.uri, new vscode.Position(0, 0), content);

			await vscode.workspace.applyEdit(edit);
		}

		// fixme: not tested
		// if package is found, compare package name to this.packageName if they are different, replace package name
		if (packageCapture.length > 0) {
			let packageNode = packageCapture[0].node;
			if (this.context.packageName !== packageNode.text) {
				let edit = new vscode.WorkspaceEdit();

				let pkgNameRange = new vscode.Range(
					PositionUtil.fromNode(packageNode.startPosition),
					PositionUtil.fromNode(packageNode.endPosition),
				);

				edit.replace(document.uri, pkgNameRange, this.context.packageName);
				await vscode.workspace.applyEdit(edit);
			}
		}
	}
}
