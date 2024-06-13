import { CodeFile, CodeFunction, CodeStructure } from '../CodeElement';
import { Presenter } from './Presenter';

export class PlantUMLPresenter implements Presenter {
	present(file: CodeFile): string {
		return this.render(file);
	}

	/**
	 * The `render` method is a protected method in TypeScript that generates a PlantUML string representation of a given `CodeFile` object.
	 *
	 * @param {CodeFile} file - The `CodeFile` object that needs to be converted into a PlantUML string.
	 *
	 * @returns {string} - Returns a string that represents the PlantUML diagram of the given `CodeFile` object.
	 *
	 * The method starts by initializing a PlantUML string with `@startuml\n`. If the `CodeFile` object has a package, it is added to the PlantUML string.
	 *
	 * The method then iterates through the imports in the `CodeFile` object and adds them to the PlantUML string as comments.
	 *
	 * A new Map object, `classMap`, is created to store the classes in the `CodeFile` object. The method then iterates through the classes in the `CodeFile` object, and for each class, it adds the class to the `classMap` with the class name as the key and the class object as the value.
	 *
	 * The method then iterates through the `classMap` and for each class, it converts the class into a PlantUML string using the `convertClassToPlantUml` method and adds it to the PlantUML string.
	 *
	 * Finally, the method ends the PlantUML string with `@enduml\n` and returns the PlantUML string.
	 */
	protected render(file: CodeFile): string {
		let plantUmlString = `@startuml\n`;

		// Add package if available
		if (file.package) {
			plantUmlString += `'package ${file.package}\n`;
		}

		// Iterate through imports and add them to the PlantUML string as comments
		file.imports.forEach(importItem => {
			plantUmlString += `'${importItem}\n`;
		});

		// Create a map to store classes
		file.classes.forEach(classItem => {
			plantUmlString += this.convertClassToPlantUml(classItem);
		});

		plantUmlString += `@enduml\n`;
		return plantUmlString;
	}

	protected renderClass(clazz: CodeStructure): string {
		return this.convertClassToPlantUml(clazz);
	}

	private convertClassToPlantUml(classItem: CodeStructure): string {
		let plantUmlString = `class ${classItem.name} {\n`;

		// Iterate through fields and convert them to PlantUML syntax
		classItem.fields?.forEach(field => {
			plantUmlString += `  ${field.name}: ${field.type}\n`;
		});

		// Iterate through methods and convert them to PlantUML syntax
		classItem.methods.forEach(method => {
			plantUmlString += this.convertFunctionToPlantUml(method, true);
		});

		plantUmlString += `}\n`;
		return plantUmlString;
	}

	private convertFunctionToPlantUml(functionItem: CodeFunction, isMethod: boolean = false): string {
		// FIXME: the space before the string should be calculated based on the nest level
		let plantUmlString = `  ${isMethod ? '+' : ''}${functionItem.name}(`;

		// Iterate through function parameters and convert them to PlantUML syntax
		functionItem.vars.forEach((variable, index) => {
			plantUmlString += `${variable.name}: ${variable.type}${index !== functionItem.vars.length - 1 ? ', ' : ''}`;
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
