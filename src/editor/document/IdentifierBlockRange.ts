import { BlockRange } from "./BlockRange";

export class IdentifierBlockRange {
	commentRange: BlockRange | undefined;
	blockRange: BlockRange;
	identifierRange: BlockRange;
	blockType: string | undefined;

	constructor(
		blockRange: BlockRange,
		identifierRange: BlockRange,
		commentRange?: BlockRange
	) {
		this.blockRange = blockRange;
		this.identifierRange = identifierRange;
		this.commentRange = commentRange;
	}
}
