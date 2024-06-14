import { TextRange } from '../model/TextRange';

export class NodeKind {
	range: TextRange;

	constructor(range: TextRange) {
		this.range = range;
	}

	name(buffer: string): string {
		return buffer.substring(this.range!!.start.byte, this.range!!.end.byte);
	}
}
