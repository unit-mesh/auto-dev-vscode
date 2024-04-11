export interface PositionElement {
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
