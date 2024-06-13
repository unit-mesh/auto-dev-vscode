import { AutoDevExtension } from '../../../AutoDevExtension';
import { AutoPage } from './AutoPage';
import { UserProjectComponent } from './UserProjectComponent';

export class ReactAutoPage implements AutoPage {
	userTask: string;
	extension: AutoDevExtension;

	constructor(userTask: string, extension: AutoDevExtension) {
		this.userTask = userTask;
		this.extension = extension;
	}

	clarify(): string {
		return '';
	}

	design(context: any): string[] {
		return [];
	}

	execute(context: any): string {
		return '';
	}

	fix(errors: string): string {
		return '';
	}

	getComponents(): UserProjectComponent[] {
		return [];
	}

	getDesignSystemComponents(): UserProjectComponent[] {
		return [];
	}

	getPages(): UserProjectComponent[] {
		return [];
	}

	getRoutes(): Map<string, string> {
		return new Map<string, string>();
	}

	sampleRemoteCall(): string {
		return '';
	}

	sampleStateManagement(): string | null {
		return null;
	}
}
