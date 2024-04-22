import { GradleBuildToolProvider } from "./GradleBuildToolProvider";

export class BuildToolSync {
	async startWatch() {
		try {
			if (await GradleBuildToolProvider.instance().isApplicable()) {
				await GradleBuildToolProvider.instance().startWatch();
			}
		} catch (error) {
			// do nothing
		}
	}
}