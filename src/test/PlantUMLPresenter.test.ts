import { CodeFile } from "../model/CodeFile.ts";
import { PlantUMLPresenter } from "../model/presenter/PlantUMLPresenter.ts";
import { expect } from 'chai';

describe('PlantUMLPresenter', () => {
  it('should convert a simple file to PlantUML', () => {
    let codeFile: CodeFile = {
      package: 'com.example',
      fileName: "ExampleClass.java",
      path: 'com/example',
      functions: [],
      imports: ['import java.util.List'],
      classes: [
        {
          name: 'ExampleClass',
          package: 'com.example.ExampleClass',
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

    // Act
    const presenter = new PlantUMLPresenter();
    const plantUmlString = presenter.convert(codeFile);

    // Assert
    expect(plantUmlString).to.equal(
      `@startuml
'package com.example
'import java.util.List
class ExampleClass {
  +exampleMethod(param1: string, param2: int) : void
}
@enduml
`,
    );
  });
});