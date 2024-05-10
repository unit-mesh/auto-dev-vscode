import { injectable } from "inversify";

import { ToolchainContextItem, ToolchainContextProvider, CreateToolchainContext } from "../ToolchainContextProvider";
import { GradleBuildToolProvider } from "../buildtool/GradleBuildToolProvider";

@injectable()
export class JavaVersionProvider implements ToolchainContextProvider {
	private clazzName = this.constructor.name;

	async isApplicable(context: CreateToolchainContext): Promise<boolean> {
		return context.language === "java" && GradleBuildToolProvider.instance().isApplicable(context);
	}

	async collect(context: CreateToolchainContext): Promise<ToolchainContextItem[]> {
		let gradleInfo;
		try {
			gradleInfo = await GradleBuildToolProvider.instance().getGradleVersion();
		} catch (e) {
			console.info(e);
			return [];
		}

		if (gradleInfo) {
			return [
				{
					clazz: this.clazzName,
					text: `You are using Java SDK version ${gradleInfo.jvmVersion}.`
				}
			];
		}

		return [];
	}
}