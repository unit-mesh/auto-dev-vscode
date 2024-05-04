import { JavaRelevantLookup } from "../../../code-search/lookup/JavaRelevantLookup";

const Parser = require("web-tree-sitter");
import 'reflect-metadata';

import { TreeSitterFile } from "../../../code-context/ast/TreeSitterFile";
import { JavaLangConfig } from "../../../code-context/java/JavaLangConfig";
import { TestLanguageService } from "../../TestLanguageService";
import { ScopeGraph } from "../../../code-search/semantic/ScopeGraph";
import { JavaStructurer } from "../../../code-context/java/JavaStructurer";
import { expect } from "vitest";
import { functionToRange } from "../../../editor/codemodel/CodeFile";


describe('RelevantClass for Java', () => {
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

	it('calculate for services', async () => {
		const controller =
			`package cc.unitmesh.untitled.demo.controller;

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

		let tree = parser.parse(controller);
		const tsf = new TreeSitterFile(controller, tree, langConfig, parser, language, "");
		const graph: ScopeGraph = await tsf.scopeGraph();

		let imports = graph.allImportsBySource(controller);

		let structurer = new JavaStructurer();
		await structurer.init(new TestLanguageService(parser));

		let codeFile = await structurer.parseFile(controller, "");
		let secondFunc = codeFile!!.classes[0].methods[0];
		let textRange = functionToRange(secondFunc);

		let ios: string[] = await structurer.extractMethodInputOutput(tsf.tree.rootNode, textRange) ?? [];

		let scopes: string[] = await structurer.fetchImportsWithinScope(graph, tsf.tree.rootNode, controller) ?? [];
		console.log("extractImportByRange:", scopes);

		let fields = await structurer.extractFields(tsf.tree.rootNode);

		expect(fields.length).toEqual(1);
		expect(fields[0].name).toEqual('blogService');
		expect(fields[0].typ).toEqual('BlogService');

		let lookup = new JavaRelevantLookup(tsf);
		let relevantClasses = lookup.calculateRelevantClass(ios, imports);

		expect(relevantClasses).toEqual(['cc/unitmesh/untitled/demo/cc/unitmesh/untitled/demo/entity/BlogPost']);
	});

	// todo: handle for array type;
	it('calculate for services with array', async () => {
		const controller =
			`package cc.unitmesh.untitled.demo.controller;

import cc.unitmesh.untitled.demo.entity.BlogPost;
import cc.unitmesh.untitled.demo.service.BlogService;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class BlogController {
		BlogService blogService;

		public BlogController(BlogService blogService) {
				this.blogService = blogService;
		}

		@GetMapping("/{id}")
		public BlogPost[] getBlog(@PathVariable Long id) {
				return blogService.getBlogById(id);
		}
}
`;

		let tree = parser.parse(controller);
		const tsf = new TreeSitterFile(controller, tree, langConfig, parser, language, "");
		const graph: ScopeGraph = await tsf.scopeGraph();

		let imports = graph.allImportsBySource(controller);
		let structurer = new JavaStructurer();
		await structurer.init(new TestLanguageService(parser));

		let codeFile = await structurer.parseFile(controller, "");
		let secondFunc = codeFile!!.classes[0].methods[0];
		let textRange = functionToRange(secondFunc);

		let ios: string[] = await structurer.extractMethodInputOutput(tsf.tree.rootNode, textRange) ?? [];

		let lookup = new JavaRelevantLookup(tsf);
		let relevantClasses = lookup.calculateRelevantClass(ios, imports);

		// expect(relevantClasses).toEqual(['cc/unitmesh/untitled/demo/cc/unitmesh/untitled/demo/entity/BlogPost']);
	});
});
