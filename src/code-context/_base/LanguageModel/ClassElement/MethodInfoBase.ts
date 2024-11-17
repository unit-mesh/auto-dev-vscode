import Parser from "web-tree-sitter";
import { ElementBase } from "./ElementBase";


export abstract class MethodInfoBase extends ElementBase
{

	returnDoc: string= "";
	name: string= ""	;
	parameters: IParameterInfo[]= [];
	methodDoc: string= "";
	code:string= "";
	modifiers: string[] = [];

	public constructor(methodNode: Parser.SyntaxNode) {
			super(methodNode);
	}
	protected abstract getMethodDoc(): string;
	protected abstract getParameters(): IParameterInfo[];
	protected abstract getName(): string;

}
export interface IParameterInfo {
	type: string;
	name: string;
	doc?: string;
}
