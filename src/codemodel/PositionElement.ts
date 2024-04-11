import { CodePosition } from "./CodeFile.ts";

export interface PositionElement {
	start: CodePosition;
	end: CodePosition;
}