import { TextInRange } from "./TextInRange";
import { CodeElementType } from "../codemodel/CodeElementType";
import { TreeSitterFile } from "../../code-context/ast/TreeSitterFile";

/**
 * Represents a named element block for AST element.
 * For example, in Java, a named element block could be a class or a method.
 *
 *```java
 * class HelloWorld {
 *   // This is a method comment
 * 	 public static void main(string[] args) {
 * 	 		System.Out.Println("Hello " + args[0]);
 * 	 	}
 * }
 *```
 *
 * In the above example, if we present the `main` method as a named element block
 * - blockRange: `public static void main(string[] args) { ... }`
 * - identifierRange: `main`
 * - codeElementType: `CodeElementType.Method`
 * - blockContent: `public static void main(string[] args) { ... }`
 * - commentRange: `// This is a method comment`
 */
export class NamedElement {
	blockRange: TextInRange;
	identifierRange: TextInRange;
	codeElementType: CodeElementType;
	blockContent: string;
	commentRange: TextInRange | undefined;
	file: TreeSitterFile;

	constructor(
		blockRange: TextInRange,
		identifierRange: TextInRange,
		codeElementType: CodeElementType,
		blockContent: string,
		file: TreeSitterFile
	) {
		this.blockRange = blockRange;
		this.identifierRange = identifierRange;
		this.blockContent = blockContent;
		this.codeElementType = codeElementType;
		this.file = file;
	}

	isTestFile(): boolean {
		return this.file.isTestFile();
	}
}
