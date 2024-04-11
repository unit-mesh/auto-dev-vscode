import { CodePosition, CodeVariable, PositionElement } from "./CodeMisc.ts";
import { CodeFunction } from "./CodeFunction.ts";

export interface CodeStructure extends PositionElement {
	name: string;
	package: string;
	extends: string[];
	implements: string[];
	constant: CodeVariable[];
	// in some languages, functions and methods are different names
	methods: CodeFunction[];
	start: CodePosition;
	end: CodePosition;
}