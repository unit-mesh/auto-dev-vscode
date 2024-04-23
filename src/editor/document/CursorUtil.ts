import vscode, { Position, Selection } from "vscode";
import { getParserForFile, getTreePathAtCursor } from "../language/parser/ParserUtil";
import { parse } from "../language/parser/TreeSitterParser";
import { PositionUtil } from "./PositionUtil";

export namespace CursorUtil {
	/**
	 * Todo: add by scope?
	 */
	export async function selectionFromNode(): Promise<Selection> {
		let editor = vscode.window.activeTextEditor;
		const currentFile = editor?.document;
		if (!currentFile) {
			return Promise.reject("No active file");
		}

		const parser = await getParserForFile(currentFile.uri.path, currentFile.uri);
		if (!parser) {
			return Promise.reject("No parser for language: " + currentFile.languageId);
		}

		let tree = await parse(currentFile.uri, currentFile.languageId, currentFile.getText());

		const cursorPosition = editor.selection.active;
		const cursorIndex = editor.document.offsetAt(cursorPosition);

		if (!cursorIndex) {
			return Promise.reject("No cursor index");
		}

		const nodes = await getTreePathAtCursor(tree, cursorIndex!!);

		if (!nodes) {
			return Promise.reject("No nodes at cursor");
		}

		// selectCodeInRange()
		const firstNode = nodes[0];
		let selection = PositionUtil.selectionFromNode(firstNode);
		return selection;
	}
}