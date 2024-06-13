import { TextRange } from '../model/TextRange';
import { NodeKind } from './NodeKind';

export class LocalImport extends NodeKind {
	range: TextRange;

	constructor(range: TextRange) {
		super(range);
		this.range = range;
	}
}
