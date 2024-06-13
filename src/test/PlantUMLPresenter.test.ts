import { CodeFile, StructureType } from '../editor/codemodel/CodeElement';
import { PlantUMLPresenter } from '../editor/codemodel/presenter/PlantUMLPresenter';

describe('PlantUMLPresenter', () => {
	it('should convert a simple file to PlantUML', () => {
		const codeFile: CodeFile = {
			name: 'ExampleClass',
			package: 'com.example',
			filepath: 'ExampleClass.java',
			language: 'java',
			path: 'com/example',
			functions: [],
			imports: ['import java.util.List'],
			classes: [
				{
					name: 'ExampleClass',
					type: StructureType.Class,
					package: 'com.example.ExampleClass',
					canonicalName: 'com.example.ExampleClass',
					start: { row: 1, column: 1 },
					end: { row: 1, column: 1 },
					implements: [],
					methods: [
						{
							name: 'exampleMethod',
							vars: [
								{ name: 'param1', type: 'string', start: { row: 0, column: 0 }, end: { row: 0, column: 0 } },
								{ name: 'param2', type: 'int', start: { row: 0, column: 0 }, end: { row: 0, column: 0 } },
							],
							returnType: 'void',
							start: { row: 1, column: 1 },
							end: { row: 1, column: 1 },
						},
					],
				},
			],
		};

		const presenter = new PlantUMLPresenter();
		const plantUmlString = presenter.present(codeFile);

		expect(plantUmlString).toBe(
			`@startuml
'package com.example
'import java.util.List
class ExampleClass {
  +exampleMethod(param1: string, param2: int): void
}
@enduml
`,
		);
	});
});
