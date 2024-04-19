import { BlockRange } from "./BlockRange";
import { CodeElement } from "../codemodel/CodeFile";
import { CodeElementType } from "../codemodel/CodeElementType";

export class IdentifierBlock {
	commentRange: BlockRange | undefined;
	blockRange: BlockRange;
	identifierRange: BlockRange;
	codeElementType: CodeElementType;
	blockElement: CodeElement | undefined;

	constructor(
		blockRange: BlockRange,
		identifierRange: BlockRange,
		codeElementType: CodeElementType,
		codeElement?: CodeElement,
		commentRange?: BlockRange
	) {
		this.blockRange = blockRange;
		this.identifierRange = identifierRange;
		this.commentRange = commentRange;
		this.blockElement = codeElement;
		this.codeElementType = codeElementType;
	}
}
