import { CodePosition, PositionElement } from "./CodeMisc.ts";

export interface CodeFunction extends PositionElement {
	name: string;
	vars: string[];
	returnType?: string;
	start: CodePosition;
	end: CodePosition;
}