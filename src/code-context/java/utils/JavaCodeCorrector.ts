import vscode from "vscode";

import { TreeSitterFile } from "../../ast/TreeSitterFile";
import { PositionUtil } from "../../../editor/ast/PositionUtil";
import { textToTreeSitterFile } from "../../ast/TreeSitterWrapper";

export class JavaCodeCorrector {
	private document: vscode.TextDocument;
	private sourcecode: string;
	private packageName: string;
	private targetClassName: string;

	constructor(document: vscode.TextDocument, sourcecode: string, pkgName: string, targetClassName: string) {
		this.document = document;
		this.sourcecode = sourcecode;
		this.packageName = pkgName;
		this.targetClassName = targetClassName;
	}

	async correct() {
		let tsfile = await textToTreeSitterFile(this.sourcecode, "java");

		if (!tsfile) {
			return Promise.reject(`Failed to find tree-sitter file for: ${this.document.uri}`);
		}

		await this.fixIncorrectClassName(tsfile, this.document);
		await this.fixIncorrectPackageName(tsfile, this.document);
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
			if (this.targetClassName !== classNode.text) {
				let edit = new vscode.WorkspaceEdit();

				let classNameRange = new vscode.Range(
					PositionUtil.fromNode(classNode.startPosition),
					PositionUtil.fromNode(classNode.endPosition)
				);

				edit.replace(document.uri, classNameRange, this.targetClassName);
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
			let content = "package " + this.packageName + ";\n\n";

			let edit = new vscode.WorkspaceEdit();
			edit.insert(document.uri, new vscode.Position(0, 0), content);

			await vscode.workspace.applyEdit(edit);
		}

		// fixme: not tested
		// if package is found, compare package name to this.packageName if they are different, replace package name
		if (packageCapture.length > 0) {
			let packageNode = packageCapture[0].node;
			if (this.packageName !== packageNode.text) {
				let edit = new vscode.WorkspaceEdit();

				let pkgNameRange = new vscode.Range(
					PositionUtil.fromNode(packageNode.startPosition),
					PositionUtil.fromNode(packageNode.endPosition)
				);

				edit.replace(document.uri, pkgNameRange, this.packageName);
				await vscode.workspace.applyEdit(edit);
			}
		}
	}
}
