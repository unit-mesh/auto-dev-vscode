import { ActionVariable } from "../ActionVariable";

const SELECTION = new ActionVariable("selection", "The selected text");
const BEFORE_CURSOR = new ActionVariable("beforeCursor", "The text before the cursor");
const AFTER_CURSOR = new ActionVariable("afterCursor", "The text after the cursor");
const FILE_NAME = new ActionVariable("fileName", "The name of the file");
const FILE_PATH = new ActionVariable("filePath", "The path of the file");
const METHOD_NAME = new ActionVariable("methodName", "The name of the method");
const LANGUAGE = new ActionVariable("language", "The language of the file");
const COMMENT_SYMBOL = new ActionVariable("commentSymbol", "The comment symbol of the language");
const FRAMEWORK_CONTEXT = new ActionVariable("frameworkContext", "The context of the framework");

export enum BuiltinVariables {
	SELECTION = "selection",
	BEFORE_CURSOR = "beforeCursor",
	AFTER_CURSOR = "afterCursor",
	FILE_NAME = "fileName",
	FILE_PATH = "filePath",
	METHOD_NAME = "methodName",
	LANGUAGE = "language",
	COMMENT_SYMBOL = "commentSymbol",
	FRAMEWORK_CONTEXT = "frameworkContext",
}

export const BuiltinVariableMap: Map<BuiltinVariables, ActionVariable> = new Map([
	[BuiltinVariables.SELECTION, SELECTION],
	[BuiltinVariables.BEFORE_CURSOR, BEFORE_CURSOR],
	[BuiltinVariables.AFTER_CURSOR, AFTER_CURSOR],
	[BuiltinVariables.FILE_NAME, FILE_NAME],
	[BuiltinVariables.FILE_PATH, FILE_PATH],
	[BuiltinVariables.METHOD_NAME, METHOD_NAME],
	[BuiltinVariables.LANGUAGE, LANGUAGE],
	[BuiltinVariables.COMMENT_SYMBOL, COMMENT_SYMBOL],
	[BuiltinVariables.FRAMEWORK_CONTEXT, FRAMEWORK_CONTEXT],
]);