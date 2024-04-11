import vscode from "vscode";
import Parser from "web-tree-sitter";
import path from "path";
import fs from "fs";

import { getLanguageForFile } from "./TreeSitterParser.ts";
import { EXT_LANGUAGE_MAP } from "../language/ExtLanguageMap.ts";

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

export function getQuerySource(filepath: string) {
	const fullLangName = EXT_LANGUAGE_MAP[filepath.split(".").pop() ?? ""];
	const sourcePath = path.join(__dirname, "semantic", `${fullLangName}.scm`);
	if (!fs.existsSync(sourcePath)) {
		throw new Error("cannot find file:" + sourcePath);
	}

	// TODO: use vscode.workspace.fs.readFile
	return fs.readFileSync(sourcePath).toString();
}

export async function getSnippetsInFile(
	uri: vscode.Uri,
	filepath: string,
	contents: string
): Promise<(any & { title: string })[]> {
	const lang = await getLanguageForFile(filepath, uri);
	if (!lang) {
		return [];
	}
	const parser = await getParserForFile(uri, filepath);
	if (!parser) {
		return [];
	}
	const ast = parser.parse(contents);
	const query = lang?.query(getQuerySource(filepath));
	const matches = query?.matches(ast.rootNode);

	return (
		matches?.flatMap((match) => {
			const node = match.captures[0].node;
			const title = match.captures[1].node.text;
			const results = {
				title,
				content: node.text,
				startLine: node.startPosition.row,
				endLine: node.endPosition.row,
			};
			return results;
		}) ?? []
	);
}

export async function getAst(
	uri: vscode.Uri,
	filepath: string,
	fileContents: string
): Promise<Parser.Tree | undefined> {
	const parser = await getParserForFile(uri, filepath);

	if (!parser) {
		return undefined;
	}

	try {
		return parser.parse(fileContents);
	} catch (e) {
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