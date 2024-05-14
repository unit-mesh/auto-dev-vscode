export class CustomAgentAuth {
	type: AuthType;
	token: string;

	constructor(type: AuthType = AuthType.Bearer, token: string = '') {
		this.type = type;
		this.token = token;
	}
}

export enum AuthType {
	Bearer = 'Bearer'
}