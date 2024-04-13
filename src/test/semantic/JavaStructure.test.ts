import { JavaStructurer } from "../../semantic/java/JavaStructurer";
import { TestLanguageService } from "../TestLanguageService";
import { CodeFile } from "../../codemodel/CodeFile";

const Parser = require("web-tree-sitter");

describe('JavaStructure', () => {
	it('should convert a simple file to CodeFile', async () => {
		const javaHelloWorld = `package com.example;
import java.util.List;

public class ExampleClass {
	public void exampleMethod(String param1, int param2) {
		System.out.println("Hello World");
	}
}`;

		await Parser.init();
		const parser = new Parser();
		const languageService = new TestLanguageService(parser);

		const structurer = new JavaStructurer();
		await structurer.init(languageService);

		const codeFile = await structurer.parseFile(javaHelloWorld);
		expect(codeFile as CodeFile).toEqual({
			"fileName": "",
			"language": "java",
			"functions": [],
			"path": "",
			"package": "com.example",
			"imports": [
				"java.util.List"
			],
			"classes": [
				{
					"constant": [],
					"extends": [],
					"methods": [
						{
							"vars": [],
							"name": "exampleMethod",
							"start": {
								"row": 4,
								"column": 1
							},
							"end": {
								"row": 6,
								"column": 2
							},
							"returnType": "void"
						}
					],
					"name": "ExampleClass",
					"canonicalName": "com.example.ExampleClass",
					"package": "",
					"implements": [],
					"start": {
						"row": 4,
						"column": 54
					},
					"end": {
						"row": 6,
						"column": 2
					}
				}
			]
		});
	});
});
