export class UserProjectComponent {
	name: string;
	path: string;
	signature?: string;
	props?: string[];

	constructor(name: string, path: string, signature: string = '', props: string[] = []) {
		this.name = name;
		this.path = path;
		this.signature = signature;
		this.props = props;
	}

	format(): string {
		let based = `component name: ${this.name}\ncomponent path: ${this.path}\ninput signature: ${this.signature}`;
		if (this.props) {
			based += `component props: ${this.props.join(', ')}`;
		}

		return based;
	}
}
