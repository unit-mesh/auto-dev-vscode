import { TextRange } from './TextRange';

/**
 * The `ImportWithRefs` interface in TypeScript is used to represent an import statement with its references in the code.
 * It contains information about the import name, the range of the import text, the original import text, and the usage of the import text.
 *
 * @interface
 *
 * @property {string} name - Represents the name of the import, such as `List`.
 *
 * @property {TextRange} range - Represents the range of the import text in the code. The `TextRange` object typically includes the start and end positions of the import text.
 *
 * @property {string} text - Represents the original import text, like `import java.util.List;`. This is the exact text that appears in the code.
 *
 * @property {TextRange[]} refs - An array of `TextRange` objects that represent the usage of the import text in the code, like `new List<String>();`. Each `TextRange` object in the array typically includes the start and end positions of the usage of the import text.
 *
 */
export interface ImportWithRefs {
	/// the import name, like `List`
	name: string;
	/// the range of the import text
	range: TextRange;
	/// origin import text, like `import java.util.List;`
	text: string;
	/// use import text, like `new List<String>();`
	refs: TextRange[];
}
