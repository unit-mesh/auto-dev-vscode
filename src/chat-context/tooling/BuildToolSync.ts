import { GradleBuildToolProvider } from "./GradleBuildToolProvider";

export class BuildToolSync {
	async startWatch() {
		await GradleBuildToolProvider.instance().startWatch();
	}
}