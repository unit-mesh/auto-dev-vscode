import { BlockRange } from "./BlockRange";
import { CodeElement } from "../codemodel/CodeFile";
import { CodeElementType } from "../codemodel/CodeElementType";

export class IdentifierBlock {
	commentRange: BlockRange | undefined;
	blockRange: BlockRange;
	identifierRange: BlockRange;
	codeElementType: CodeElementType;
	blockContent: string;

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
