export enum HydeDocumentType {
	Code = "code",
	Keywords = "keyword",
	Text = "text",
}

export class HydeDocument<T> {
	constructor(public type: HydeDocumentType, public content: T) {
	}
}