const Parser = require("web-tree-sitter");

import { ScopeBuilder } from "../../../code-search/semantic/ScopeBuilder";
import { JavaLangConfig } from "../../../code-context/java/JavaLangConfig";
import { TestLanguageService } from "../../TestLanguageService";
import { testScopes } from "../../ScopeTestUtil";
import { TreeSitterFile } from "../../../code-context/ast/TreeSitterFile";

describe('ScopeBuilder for Java', () => {
	let parser: any;
	let language: any;
	let langConfig = JavaLangConfig;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageService(parser);

		language = await JavaLangConfig.grammar(languageService, "java")!!;
		parser.setLanguage(language);
		parser.setLogger(null);
	});

	it('build for node', async () => {
		const javaHelloWorld = `
class HelloWorld {
    public static void main(string[] args) {
        System.Out.Println("Hello " + args[0]);
    }
}
`;

		parser.setTimeoutMicros(10 ** 6);
		const rootNode = parser.parse(javaHelloWorld).rootNode;
		const query = language.query(JavaLangConfig.scopeQuery.queryStr);
		let scopeBuilder = new ScopeBuilder(query!!, rootNode, javaHelloWorld, JavaLangConfig);
		let output = await scopeBuilder.build();

		const hoverRanges = output.hoverableRanges();
		expect(hoverRanges.length).toBe(4);

		const allText = hoverRanges.map((range) => range.getText()).join(", ");
		expect(allText).toBe("args, HelloWorld, main, args");
	});

	it('test for main scopes', async () => {
		const sourceCode = `package cc.unitmesh.untitled.demo.controller;

import cc.unitmesh.untitled.demo.entity.BlogPost;
import cc.unitmesh.untitled.demo.service.BlogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BlogController {
    BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping("/{id}")
    public BlogPost getBlog(@PathVariable Long id) {
        return blogService.getBlogById(id);
    }
}
`;

		let tree = parser.parse(sourceCode);
		const tsf = new TreeSitterFile(sourceCode, tree, langConfig, parser, language, "");
		let output = await testScopes("java", sourceCode, "", tsf);


		expect(output).to.equals(JSON.stringify({
				"definitions": [{
					"context": "public class §BlogController§ {",
					"name": "BlogController",
					"range": {
						"start": { "byte": 364, "line": 9, "column": 13 },
						"end": { "byte": 378, "line": 9, "column": 27 },
						"text": "BlogController"
					},
					"refs": [],
					"symbol": "class"
				}],
				"imports": [
					{
						"name": "BlogPost",
						"range": {
							"start": { "byte": 87, "line": 2, "column": 40 },
							"end": { "byte": 95, "line": 2, "column": 48 },
							"text": "BlogPost"
						},
						"context": "import cc.unitmesh.untitled.demo.entity.§BlogPost§;",
						"refs": [{ "context": "public §BlogPost§ getBlog(@PathVariable Long id) {" }]
					},
					{
						"name": "BlogService",
						"range": {
							"start": { "byte": 138, "line": 3, "column": 41 },
							"end": { "byte": 149, "line": 3, "column": 52 },
							"text": "BlogService"
						},
						"context": "import cc.unitmesh.untitled.demo.service.§BlogService§;",
						"refs": [{ "context": "§BlogService§ blogService;" }, { "context": "public BlogController(§BlogService§ blogService) {" }]
					},
					{
						"name": "GetMapping",
						"range": {
							"start": { "byte": 198, "line": 4, "column": 47 },
							"end": { "byte": 208, "line": 4, "column": 57 },
							"text": "GetMapping"
						},
						"context": "import org.springframework.web.bind.annotation.§GetMapping§;",
						"refs": [{ "context": "@§GetMapping§(\"/{id}\")" }]
					},
					{
						"name": "PathVariable",
						"range": {
							"start": { "byte": 257, "line": 5, "column": 47 },
							"end": { "byte": 269, "line": 5, "column": 59 },
							"text": "PathVariable"
						},
						"context": "import org.springframework.web.bind.annotation.§PathVariable§;",
						"refs": [{ "context": "public BlogPost getBlog(@§PathVariable§ Long id) {" }]
					},
					{
						"name": "RestController",
						"range": {
							"start": { "byte": 318, "line": 6, "column": 47 },
							"end": { "byte": 332, "line": 6, "column": 61 },
							"text": "RestController"
						},
						"context": "import org.springframework.web.bind.annotation.§RestController§;",
						"refs": [{ "context": "@§RestController§" }]
					}
				],
				"scopes": [{
					"definitions": [
						{
							"context": "BlogService §blogService§;",
							"name": "blogService",
							"range": {
								"start": { "byte": 397, "line": 10, "column": 16 },
								"end": { "byte": 408, "line": 10, "column": 27 },
								"text": "blogService"
							},
							"refs": [
								{ "context": "this.§blogService§ = blogService;" },
								{ "context": "this.blogService = §blogService§;" },
								{ "context": "return §blogService§.getBlogById(id);" }
							],
							"symbol": "local"
						},
						{
							"context": "public §BlogController§(BlogService blogService) {",
							"name": "BlogController",
							"range": {
								"start": { "byte": 422, "line": 12, "column": 11 },
								"end": { "byte": 436, "line": 12, "column": 25 },
								"text": "BlogController"
							},
							"refs": [],
							"symbol": "method"
						}
					],
					"imports": [],
					"scopes": [
						{
							"definitions": [{
								"context": "public BlogController(BlogService §blogService§) {",
								"name": "blogService",
								"range": {
									"start": { "byte": 449, "line": 12, "column": 38 },
									"end": { "byte": 460, "line": 12, "column": 49 },
									"text": "blogService"
								},
								"refs": [
									{ "context": "this.§blogService§ = blogService;" },
									{ "context": "this.blogService = §blogService§;" }
								],
								"symbol": "local"
							}], "imports": [], "scopes": []
						},
						{
							"definitions": [
								{
									"context": "public BlogPost §getBlog§(@PathVariable Long id) {",
									"name": "getBlog",
									"range": {
										"start": { "byte": 556, "line": 17, "column": 20 },
										"end": { "byte": 563, "line": 17, "column": 27 },
										"text": "getBlog"
									},
									"refs": [],
									"symbol": "method"
								}
							],
							"imports": [],
							"scopes": [{
								"definitions": [
									{
										"context": "public BlogPost getBlog(@PathVariable Long §id§) {",
										"name": "id",
										"range": {
											"start": { "byte": 583, "line": 17, "column": 47 },
											"end": { "byte": 585, "line": 17, "column": 49 },
											"text": "id"
										},
										"refs": [{ "context": "return blogService.getBlogById(§id§);" }],
										"symbol": "local"
									}], "imports": [], "scopes": []
							}]
						}]
				}]
			}
		));
	});
});
