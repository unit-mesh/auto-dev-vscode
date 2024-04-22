import { injectable } from "inversify";

import { LangEcoContextItem, LangEcoContextProvider, LangEcoCreationContext } from "../LangEcoContextProvider";
import { GradleBuildToolProvider } from "../buildtool/GradleBuildToolProvider";

@injectable()
export class JavaSdkVersionProvider implements LangEcoContextProvider {
	async isApplicable(context: LangEcoCreationContext): Promise<boolean> {
		return context.language === "java" && GradleBuildToolProvider.instance().isApplicable();
	}

	async collect(context: LangEcoCreationContext): Promise<LangEcoContextItem[]> {
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