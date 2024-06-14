export class ConnectorConfig {
	/**
	 * will be Json Config
	 */
	requestFormat: string;
	/**
	 * will be JsonPath
	 */
	responseFormat: string;

	constructor(requestFormat: string = '', responseFormat: string = '') {
		this.requestFormat = requestFormat;
		this.responseFormat = responseFormat;
	}
}
