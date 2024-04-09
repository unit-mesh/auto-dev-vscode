import { TextRange } from "./TextRange";

export class IdentifierBlockRange {
	blockRange: TextRange;
	identifierRange: TextRange;

	constructor(
		blockRange: TextRange,
		identifierRange: TextRange
	) {
		this.blockRange = blockRange;
		this.identifierRange = identifierRange;
	}
}