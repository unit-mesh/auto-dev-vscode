import vscode from "vscode";
import Parser from "web-tree-sitter";

import { getLanguageForFile } from "./TreeSitterParser";

export async function getParserForFile(uri: vscode.Uri, filepath: string) {
	if (process.env.IS_BINARY) {
		return undefined;
	}

	try {
		await Parser.init();
		const parser = new Parser();

		const language = await getLanguageForFile(filepath, uri);
		parser.setLanguage(language);

		return parser;
	} catch (e) {
		console.error("Unable to load language for file", filepath, e);
		return undefined;
	}
}

export async function getTreePathAtCursor(
	ast: Parser.Tree,
	cursorIndex: number
): Promise<Parser.SyntaxNode[] | undefined> {
	const path = [ast.rootNode];
	while (path[path.length - 1].childCount > 0) {
		let foundChild = false;
		for (let child of path[path.length - 1].children) {
			if (child.startIndex <= cursorIndex && child.endIndex >= cursorIndex) {
				path.push(child);
				foundChild = true;
				break;
			}
		}

		if (!foundChild) {
			break;
		}
	}

	return path;
}
