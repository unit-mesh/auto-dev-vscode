console.log("hello from typescript.ts");

export class SampleClass {
	field: string;

	constructor() {
		console.log("SampleClass constructor");
		this.field = "SampleClass field";
	}

	setField(value: string) {
		this.field = value;
	}

	getField() {
		return this.field;
	}

	public sampleMethod() {
		console.log("SampleClass sampleMethod");
	}
}