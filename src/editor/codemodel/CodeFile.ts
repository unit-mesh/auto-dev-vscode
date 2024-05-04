import { PositionElement } from "./PositionElement";
import { SupportedLanguage } from "../language/SupportedLanguage";
import { Point, TextRange } from "../../code-search/semantic/model/TextRange";

export interface CodeFile extends CodeElement {
	name: string;
	filepath: string;
	language: SupportedLanguage;
	path: string;
	package: string;
	imports: string[];
	classes: CodeStructure[];
	functions?: CodeFunction[];
}

export interface CodeStructure extends PositionElement, CodeElement {
	name: string;
	// like a package, `com.example.ExampleClass` is the canonical name
	canonicalName: string,
	package: string;
	extends?: string[];
	implements: string[];
	constant?: CodeVariable[];
	// in some languages, functions and methods are different names
	methods: CodeFunction[];
	start: CodePosition;
	end: CodePosition;
}

export interface CodeFunction extends PositionElement, CodeElement {
	name: string;
	vars: CodeVariable[];
	returnType?: string;
	start: CodePosition;
	end: CodePosition;
}

export function functionToRange(element: CodeFunction): TextRange {
	const startPoint: Point = { line: element.start.row, column: element.start.column, byte: 0 };
	const endPoint: Point = { line: element.end.row, column: element.end.column, byte: 0 };
	return new TextRange(startPoint, endPoint, "");
}

export interface CodeVariable extends CodeElement {
	name: string;
	typ: string;
	isSystemType?: boolean;
}

export interface CodeElement {
	name: string;
}

export interface CodePosition {
	row: number;
	column: number;
}
