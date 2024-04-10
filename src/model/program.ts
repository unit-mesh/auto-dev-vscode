export interface CodeFile {
	file_name: string;
	path: string;
	package: string;
	imports: string[];
	classes: CodeStructure[];
	functions: CodeFunction[];
}

export interface PositionElement {
	start: CodePosition;
	end: CodePosition;
}

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

export interface CodeFunction extends PositionElement {
	name: string;
	vars: string[];
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
