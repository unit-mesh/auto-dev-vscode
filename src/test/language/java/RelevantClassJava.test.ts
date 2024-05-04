import { JavaRelevantLookup } from "../../../code-search/lookup/JavaRelevantLookup";

const Parser = require("web-tree-sitter");
import 'reflect-metadata';

import { TreeSitterFile } from "../../../code-context/ast/TreeSitterFile";
import { JavaLangConfig } from "../../../code-context/java/JavaLangConfig";
import { TestLanguageService } from "../../TestLanguageService";
import { ScopeGraph } from "../../../code-search/semantic/ScopeGraph";
import { JavaStructurer } from "../../../code-context/java/JavaStructurer";
import { expect } from "vitest";


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

		const service = `package cc.unitmesh.untitled.demo.service;

import cc.unitmesh.untitled.demo.entity.BlogPost;
import cc.unitmesh.untitled.demo.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BlogService {
    @Autowired
    BlogRepository blogRepository;

    public BlogPost getBlogById(Long id) {
        return blogRepository.findById(id).orElse(null);
    }
}
`;

		const repository = `package cc.unitmesh.untitled.demo.repository;

import cc.unitmesh.untitled.demo.entity.BlogPost;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogRepository extends CrudRepository<BlogPost, Long> {

}
`;

		let tree = parser.parse(controller);
		const tsf = new TreeSitterFile(controller, tree, langConfig, parser, language, "");
		const graph: ScopeGraph = await tsf.scopeGraph();

		let imports = graph.allImports(controller);
		let structurer = new JavaStructurer();
		await structurer.init(new TestLanguageService(parser));
		let ios: string[] = await structurer.extractMethodInputOutput(`
		@GetMapping("/{id}")
    public BlogPost getBlog(@PathVariable Long id) {
        return blogService.getBlogById(id);
    }
    `) ?? [];

		let lookup = new JavaRelevantLookup(tsf);
		let relevantClasses = lookup.calculateRelevantClass(ios, imports);

		expect(relevantClasses).toEqual(['cc/unitmesh/untitled/demo/cc/unitmesh/untitled/demo/entity/BlogPost']);
	});

	// todo: handle for array type;
});