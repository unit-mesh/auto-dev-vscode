import { CodeFile } from "../../../editor/codemodel/CodeFile";
import { CommentedUmlPresenter } from "../../../editor/codemodel/presenter/CommentedUmlPresenter";

describe('CommentUmlPresenter', () => {
	it('should convert a simple file to PlantUML', () => {
		const codeFile: CodeFile = {
			name: 'ExampleClass',
			package: 'com.example',
			filepath: "ExampleClass.java",
			language: "java",
			path: 'com/example',
			functions: [],
			imports: ['import java.util.List'],
			classes: [
				{
					name: 'ExampleClass',
					package: 'com.example.ExampleClass',
					canonicalName: 'com.example.ExampleClass',
					start: { row: 1, column: 1 },
					end: { row: 1, column: 1 },
					implements: [],
					methods: [
						{
							name: 'exampleMethod',
							vars: [{ name: 'param1', type: 'string' }, { name: 'param2', type: 'int' }],
							returnType: 'void',
							start: { row: 1, column: 1 },
							end: { row: 1, column: 1 }
						},
					],
				},
			],
		};

		const presenter = new CommentedUmlPresenter();

		const plantUmlString = presenter.present(codeFile);

		expect(plantUmlString).toBe(`// @startuml
// 'package com.example
// 'import java.util.List
// class ExampleClass {
//   +exampleMethod(param1: string, param2: int): void
// }
// @enduml
// `);
	});
});