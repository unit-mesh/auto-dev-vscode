import { BlockRange } from "./BlockRange";
import { CodeElementType } from "../codemodel/CodeElementType";

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
export class NamedElementBlock {
	blockRange: BlockRange;
	identifierRange: BlockRange;
	codeElementType: CodeElementType;
	blockContent: string;
	commentRange: BlockRange | undefined;

	constructor(
		blockRange: BlockRange,
		identifierRange: BlockRange,
		codeElementType: CodeElementType,
		blockContent: string,
		commentRange?: BlockRange
	) {
		this.blockRange = blockRange;
		this.identifierRange = identifierRange;
		this.commentRange = commentRange;
		this.blockContent = blockContent;
		this.codeElementType = codeElementType;
	}
}
