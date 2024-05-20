export enum HydeDocumentType {
	Code = "code",
	Keywords = "keywords",
}

export class HydeDocument<T> {
	constructor(public type: HydeDocumentType, public content: T) {
	}
}