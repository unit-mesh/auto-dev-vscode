import { CodeFile, CodeFunction, CodeStructure } from "../CodeFile.ts";
import { Presenter } from "./Presenter.ts";

export class PlantUMLPresenter implements Presenter {
	convert(file: CodeFile): string {
		let plantUmlString = `@startuml\n`;

		// Add package if available
		if (file.package) {
			plantUmlString += `'package ${file.package}`;
		}

		// Iterate through imports and add them to the PlantUML string as comments
		file.imports.forEach(importItem => {
			plantUmlString += `'import ${importItem}\n`;
		});

		// Iterate through classes and convert them to PlantUML syntax
		file.classes.forEach(classItem => {
			plantUmlString += this.convertClassToPlantUml(classItem);
		});

		plantUmlString += `@enduml\n`;
		return plantUmlString;
	}

	private convertClassToPlantUml(classItem: CodeStructure): string {
		let plantUmlString = `class ${classItem.name} {\n`;

		// Iterate through methods and convert them to PlantUML syntax
		classItem.methods.forEach(method => {
			plantUmlString += this.convertFunctionToPlantUml(method, true);
		});

		plantUmlString += `}\n`;
		return plantUmlString;
	}

	private convertFunctionToPlantUml(functionItem: CodeFunction, isMethod: boolean = false): string {
		let plantUmlString = `${isMethod ? '+' : ''}${functionItem.name}(`;

		// Iterate through function parameters and convert them to PlantUML syntax
		functionItem.vars.forEach((variable, index) => {
			plantUmlString += `${variable.name}: ${variable.typ}${index !== functionItem.vars.length - 1 ? ', ' : ''}`;
		});

		plantUmlString += `)`;

		// Add return type if present
		if (functionItem.returnType) {
			plantUmlString += `: ${functionItem.returnType}`;
		}

		plantUmlString += `\n`;
		return plantUmlString;
	}
}
