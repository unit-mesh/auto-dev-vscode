import * as assert from 'assert';
import * as vscode from 'vscode';
import Parser from "web-tree-sitter";

import { JavaStructureParser } from "../semantic-treesitter/java/JavaStructureParser";

suite('JavaStructureParser', () => {
	suiteTeardown(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	test('CodeFile', async () => {
		await Parser.init();
		let structureParser = new JavaStructureParser();
		await structureParser.init();
		const codeFile = await structureParser.parseFile("class Test { }");
		console.log(codeFile);
		assert.notStrictEqual(codeFile, undefined);
	});
});

