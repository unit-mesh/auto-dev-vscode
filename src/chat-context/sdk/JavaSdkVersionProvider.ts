import { injectable } from "inversify";

import { ChatContextItem, ChatContextProvider, ChatCreationContext } from "../ChatContextProvider";
import { GradleTooling } from "../tooling/GradleTooling";

@injectable()
export class JavaSdkVersionProvider implements ChatContextProvider {
	async isApplicable(context: ChatCreationContext): Promise<boolean> {
		return context.language === "java" && GradleTooling.instance().isApplicable();
	}

	async collect(context: ChatCreationContext): Promise<ChatContextItem[]> {
		let gradleInfo;
		try {
			gradleInfo = await GradleTooling.instance().getGradleVersion();
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