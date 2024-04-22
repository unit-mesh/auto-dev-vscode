import { injectable } from "inversify";

import { ToolchainContextItem, ToolchainContextProvider, CreateToolchainContext } from "../ToolchainContextProvider";
import { GradleBuildToolProvider } from "../buildtool/GradleBuildToolProvider";

@injectable()
export class JavaSdkVersionProvider implements ToolchainContextProvider {
	async isApplicable(context: CreateToolchainContext): Promise<boolean> {
		return context.language === "java" && GradleBuildToolProvider.instance().isApplicable();
	}

	async collect(context: CreateToolchainContext): Promise<ToolchainContextItem[]> {
		let gradleInfo;
		try {
			gradleInfo = await GradleBuildToolProvider.instance().getGradleVersion();
		} catch (e) {
			console.error(e);
			return [];
		}

		if (gradleInfo) {
			return [
				{
					clazz: JavaSdkVersionProvider.name,
					text: `You are using Java SDK version ${gradleInfo.jvmVersion}.`
				}
			];
		}

		return [];
	}
}