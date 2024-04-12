import { JavaStructurer } from "../../semantic-treesitter/structurer/JavaStructurer";
import { TSLanguageService } from "../../language/service/TSLanguageService";
import { TestLanguageService } from "../TestLanguageService";

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
		expect(codeFile?.package).toEqual('com.example');
	});
});
