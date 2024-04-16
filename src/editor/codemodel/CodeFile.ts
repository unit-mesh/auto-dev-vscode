import { PositionElement } from "./PositionElement";
import { SupportedLanguage } from "../language/SupportedLanguage";

export interface CodeFile {
	fileName: string;
	language: SupportedLanguage;
	path: string;
	package: string;
	imports: string[];
	classes: CodeStructure[];
	functions?: CodeFunction[];
}

export interface CodeStructure extends PositionElement {
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

export interface CodeFunction extends PositionElement {
	name: string;
	vars: CodeVariable[];
	returnType?: string;
	start: CodePosition;
	end: CodePosition;
}

export interface CodeVariable {
	name: string;
	typ: string;
}

export interface CodePosition {
	row: number;
	column: number;
}
