import { ActionVariable } from "./ActionVariable";

const SELECTION = new ActionVariable("selection", "The selected text");
const BEFORE_CURSOR = new ActionVariable("beforeCursor", "The text before the cursor");
const AFTER_CURSOR = new ActionVariable("afterCursor", "The text after the cursor");
const FILE_NAME = new ActionVariable("fileName", "The name of the file");
const FILE_PATH = new ActionVariable("filePath", "The path of the file");
const METHOD_NAME = new ActionVariable("methodName", "The name of the method");
const LANGUAGE = new ActionVariable("language", "The language of the file");
const COMMENT_SYMBOL = new ActionVariable("commentSymbol", "The comment symbol of the language");
const FRAMEWORK_CONTEXT = new ActionVariable("frameworkContext", "The context of the framework");

export const BuiltinVariables: ActionVariable[] = [
	SELECTION,
	BEFORE_CURSOR,
	AFTER_CURSOR,
	FILE_NAME,
	FILE_PATH,
	METHOD_NAME,
	LANGUAGE,
	COMMENT_SYMBOL,
	FRAMEWORK_CONTEXT,
];