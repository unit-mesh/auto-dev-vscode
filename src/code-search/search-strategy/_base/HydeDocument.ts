export enum HydeDocumentType {
	Code,
	Keyword,
	Text,
}

export class HydeDocument<T> {
	constructor(public type: HydeDocumentType, public content: T) {
	}
}