export class CustomFlowTransition {
	/**
	 * will be JsonPath
	 */
	source: string;
	/**
	 * will be JsonPath too
	 */
	target: string;

	constructor(source: string, target: string) {
		this.source = source;
		this.target = target;
	}
}
