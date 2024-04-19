import { GradleTooling } from "./GradleTooling";

/**
 * When the extension is activated, we can process the tooling detection.
 */
export class ToolingDetector {
	async startWatch() {
		await GradleTooling.instance().startWatch();
	}
}