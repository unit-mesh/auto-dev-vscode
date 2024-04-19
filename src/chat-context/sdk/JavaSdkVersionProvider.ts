import { ChatContextItem, ChatContextProvider, ChatCreationContext } from "../ChatContextProvider";
import { GradleTooling } from "../tooling/GradleTooling";

export class JavaSdkVersionProvider extends ChatContextProvider {
	name = "JavaSdkVersionProvider";

	isApplicable(context: ChatCreationContext): boolean {
		return context.language === "java";
	}

	async collect(context: ChatCreationContext): Promise<ChatContextItem[]> {
		const gradleInfo = await GradleTooling.instance().getGradleVersion();
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