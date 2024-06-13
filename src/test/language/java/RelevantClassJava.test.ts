import 'reflect-metadata';

import { LanguageProfileUtil } from '../../../code-context/_base/LanguageProfile';
import { TreeSitterFile } from '../../../code-context/ast/TreeSitterFile';
import { JavaStructurerProvider } from '../../../code-context/java/JavaStructurerProvider';
import { JavaRelevantLookup } from '../../../code-context/java/utils/JavaRelevantLookup';
import { ScopeGraph } from '../../../code-search/scope-graph/ScopeGraph';
import { functionToRange } from '../../../editor/codemodel/CodeElement';
import { TestLanguageServiceProvider } from '../../../test/TestLanguageService';

const Parser = require('web-tree-sitter');

describe('RelevantClass for Java', () => {
	let parser: any;
	let language: any;
	let langConfig = LanguageProfileUtil.from('java')!!;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageServiceProvider(parser);

		language = await langConfig.grammar(languageService, 'java')!!;
		parser.setLanguage(language);
		parser.setLogger(null);
	});

	it('calculate for services', async () => {
		const controller = `package cc.unitmesh.untitled.demo.controller;

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
		const tsf = new TreeSitterFile(controller, tree, langConfig, parser, language, '');
		const graph: ScopeGraph = await tsf.scopeGraph();
		let structurer = new JavaStructurerProvider();
		await structurer.init(new TestLanguageServiceProvider(parser));

		let codeFile = await structurer.parseFile(controller, '');
		let secondFunc = codeFile!!.classes[0].methods[0];
		let textRange = functionToRange(secondFunc);

		let ios: string[] =
			(await structurer.retrieveMethodIOImports(graph, tsf.tree.rootNode, textRange, controller)) ?? [];
		expect(ios).toEqual([
			'import cc.unitmesh.untitled.demo.entity.BlogPost;',
			'import org.springframework.web.bind.annotation.PathVariable;',
		]);

		let fields = await structurer.extractFields(tsf.tree.rootNode);
		expect(fields.length).toEqual(1);
		expect(fields[0].name).toEqual('blogService');
		expect(fields[0].type).toEqual('BlogService');
	});

	it('calculate for services with array', async () => {
		const controller = `package cc.unitmesh.untitled.demo.controller;

import cc.unitmesh.untitled.demo.dto.CreateBlogRequest;
import cc.unitmesh.untitled.demo.dto.CreateBlogResponse;
import cc.unitmesh.untitled.demo.entity.BlogPost;
import cc.unitmesh.untitled.demo.service.BlogService;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

@RestController
public class BlogController {
    BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping("/{id}")
    public BlogPost[] getBlogs(@PathVariable String date) {
        return blogService.getBlogsByDate(date);
    }

    @PostMapping("/")
    public CreateBlogResponse createBlog(@RequestBody CreateBlogRequest request) {
        CreateBlogResponse response = new CreateBlogResponse();
        BlogPost blogPost = new BlogPost();
        BeanUtils.copyProperties(request, blogPost);
        BlogPost createdBlog = blogService.createBlog(blogPost);
        BeanUtils.copyProperties(createdBlog, response);
        return createdBlog;
    }
}
`;

		let tree = parser.parse(controller);
		const tsf = new TreeSitterFile(controller, tree, langConfig, parser, language, '');
		const graph: ScopeGraph = await tsf.scopeGraph();

		let structurer = new JavaStructurerProvider();
		await structurer.init(new TestLanguageServiceProvider(parser));
		let codeFile = await structurer.parseFile(controller, '');

		// first func
		let firstFunc = codeFile!!.classes[0].methods[0];
		let textRange = functionToRange(firstFunc);
		let lookup = new JavaRelevantLookup(tsf);
		let ios: string[] =
			(await structurer.retrieveMethodIOImports(graph, tsf.tree.rootNode, textRange, controller)) ?? [];
		let relevantClasses = lookup.relevantImportToFilePath(ios);
		expect(relevantClasses).toEqual(['src/main/java/cc/unitmesh/untitled/demo/entity/BlogPost.java']);

		// for second func
		let secondFunc = codeFile!!.classes[0].methods[1];
		textRange = functionToRange(secondFunc);
		ios = (await structurer.retrieveMethodIOImports(graph, tsf.tree.rootNode, textRange, controller)) ?? [];
		relevantClasses = lookup.relevantImportToFilePath(ios);
		expect(relevantClasses).toEqual([
			'src/main/java/cc/unitmesh/untitled/demo/dto/CreateBlogRequest.java',
			'src/main/java/cc/unitmesh/untitled/demo/dto/CreateBlogResponse.java',
		]);
	});
});
