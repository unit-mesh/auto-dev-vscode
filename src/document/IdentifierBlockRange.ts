import { TextRange } from "./TextRange";

export class IdentifierBlockRange {
	commentRange: TextRange | undefined;
	blockRange: TextRange;
	identifierRange: TextRange;

	constructor(
		blockRange: TextRange,
		identifierRange: TextRange,
		commentRange?: TextRange
	) {
		this.blockRange = blockRange;
		this.identifierRange = identifierRange;
		this.commentRange = commentRange;
	}
}
