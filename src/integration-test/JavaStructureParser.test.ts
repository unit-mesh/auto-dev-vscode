import Parser from "web-tree-sitter";
import { JavaStructurer } from "../semantic-treesitter/java/JavaStructurer";
import * as vscode from "vscode";

describe('JavaStructureParser', () => {
	afterEach(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	test('CodeFile', async () => {
		await Parser.init();
		const structureParser = new JavaStructurer();
		await structureParser.init();

		const codeFile = await structureParser.parseFile("class Test { }");

		expect(codeFile).toBeUndefined();
	});
});

