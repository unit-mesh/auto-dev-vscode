import { GradleBuildToolProvider } from "./GradleBuildToolProvider";

/**
 * When the extension is activated, we can process the tooling detection.
 */
export class ToolingDetector {
	async startWatch() {
		await GradleBuildToolProvider.instance().startWatch();
	}
}