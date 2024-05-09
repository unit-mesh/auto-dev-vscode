const Parser = require("web-tree-sitter");
import "reflect-metadata";

import { JavaStructurerProvider } from "../../../code-context/java/JavaStructurerProvider";
import { TestLanguageService } from "../../TestLanguageService";
import { CodeFile } from "../../../editor/codemodel/CodeElement";

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

		const structurer = new JavaStructurerProvider();
		await structurer.init(languageService);

		const codeFile = await structurer.parseFile(javaHelloWorld, "");
		expect(codeFile as CodeFile).toEqual({
			"name": "",
			"filepath": "",
			"language": "java",
			"functions": [],
			"path": "",
			"package": "com.example",
			"imports": [
				"java.util.List"
			],
			"classes": [
				{
					"type": "class",
					"constant": [],
					"extends": [],
					"fields": [],
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


	it('should parse for Lombok', async () => {
		const javaHelloWorld = `
package cc.unitmesh.untitled.demo.dto;

import cc.unitmesh.untitled.demo.entity.User;
import lombok.Data;

@Data
public class CreateBlogRequest {
    private String title;
    private String content;
    private User user;
}
`;

		await Parser.init();
		const parser = new Parser();
		const languageService = new TestLanguageService(parser);

		const structurer = new JavaStructurerProvider();
		await structurer.init(languageService);

		const codeFile = await structurer.parseFile(javaHelloWorld, "");
		expect(codeFile as CodeFile).toEqual({
				"name": "",
				"filepath": "",
				"language": "java",
				"functions": [],
				"path": "",
				"package": "cc.unitmesh.untitled.demo.dto",
				"imports": ["cc.unitmesh.untitled.demo.entity.User", "lombok.Data"],
				"classes": [{
					"type": "class",
					"canonicalName": "cc.unitmesh.untitled.demo.dto.CreateBlogRequest",
					"constant": [],
					"extends": [],
					"methods": [],
					"name": "CreateBlogRequest",
					"package": "",
					"implements": [],
					"start": { "row": 6, "column": 0 },
					"end": { "row": 11, "column": 1 },
					"fields": [{
						"name": "title",
						"start": { "row": 0, "column": 0 },
						"end": { "row": 0, "column": 0 },
						"type": "String"
					}, {
						"name": "content",
						"start": { "row": 0, "column": 0 },
						"end": { "row": 0, "column": 0 },
						"type": "String"
					},
						{
							"name": "user", "start": { "row": 0, "column": 0 }, "end": { "row": 0, "column": 0 }, "type": "User"
						}
					]
				}]
			}
		);
	});
});
