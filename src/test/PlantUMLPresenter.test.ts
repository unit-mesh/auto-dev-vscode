import { CodeFile } from "../editor/codemodel/CodeFile";
import { PlantUMLPresenter } from "../editor/codemodel/presenter/PlantUMLPresenter";

describe('PlantUMLPresenter', () => {
  it('should convert a simple file to PlantUML', () => {
    const codeFile: CodeFile = {
      package: 'com.example',
      fileName: "ExampleClass.java",
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
              vars: [{ name: 'param1', typ: 'string' }, { name: 'param2', typ: 'int' }],
              returnType: 'void',
              start: { row: 1, column: 1 },
              end: { row: 1, column: 1 }
            },
          ],
        },
      ],
    };

    const presenter = new PlantUMLPresenter();
    const plantUmlString = presenter.convert(codeFile);

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
