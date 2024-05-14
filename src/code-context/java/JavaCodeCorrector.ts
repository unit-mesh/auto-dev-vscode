import vscode from "vscode";

import { TreeSitterFile } from "../ast/TreeSitterFile";
import { PositionUtil } from "../../editor/ast/PositionUtil";
import { textToTreeSitterFile } from "../ast/TreeSitterWrapper";
import { CodeCorrector, CorrectorContext } from "../_base/CodeCorrector";

export class JavaCodeCorrector implements CodeCorrector {
	private context: CorrectorContext;

	constructor(context: CorrectorContext) {
		this.context = context;
	}

	async correct(): Promise<void> {
		let tsfile = await textToTreeSitterFile(this.context.sourcecode, "java");

		if (!tsfile) {
			return Promise.reject(`Failed to find tree-sitter file for: ${this.context.document.uri}`);
		}

		await this.fixIncorrectClassName(tsfile, this.context.document);
		await this.fixIncorrectPackageName(tsfile, this.context.document);
	}

	/**
	 * Fix LLM generated test file lost class name issue
	 */
	private async fixIncorrectClassName(tsfile: TreeSitterFile, document: vscode.TextDocument) {
		let query = tsfile.languageProfile.classQuery.query(tsfile.tsLanguage);
		const captures = query!!.captures(tsfile.tree.rootNode);

		const queryCapture = captures.find((c) => c.name === "name.definition.class");
		if (queryCapture) {
			// compare targetClassName to queryCapture.text if they are different, replace queryCapture.text with targetClassName
			let classNode = queryCapture.node;
			if (this.context.targetClassName !== classNode.text) {
				let edit = new vscode.WorkspaceEdit();

				let classNameRange = new vscode.Range(
					PositionUtil.fromNode(classNode.startPosition),
					PositionUtil.fromNode(classNode.endPosition)
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
			let content = "package " + this.context.packageName + ";\n\n";

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
					PositionUtil.fromNode(packageNode.endPosition)
				);

				edit.replace(document.uri, pkgNameRange, this.context.packageName);
				await vscode.workspace.applyEdit(edit);
			}
		}
	}
}
