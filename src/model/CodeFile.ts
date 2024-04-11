import { CodeStructure } from "./CodeStructure.ts";
import { CodeFunction } from "./CodeFunction.ts";

export interface CodeFile {
	fileName: string;
	path: string;
	package: string;
	imports: string[];
	classes: CodeStructure[];
	functions: CodeFunction[];
}