import assert from 'node:assert';

import * as vscode from 'vscode';
import Parser from "web-tree-sitter";

import { JavaStructurer } from "../src/semantic-treesitter/java/JavaStructurer";

suite('JavaStructureParser', () => {
	suiteTeardown(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	test('CodeFile', async () => {
		await Parser.init();
		let structureParser = new JavaStructurer();
		await structureParser.init();
		const codeFile = await structureParser.parseFile("class Test { }");
		console.log(codeFile);
		assert.notStrictEqual(codeFile, undefined);
	});
});

