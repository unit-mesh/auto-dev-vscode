import { extensions } from "vscode";
import { DependenceInfo } from "./DependenceInfo";

export class GradleSync {
	findDeps(): DependenceInfo[] {
		let java = extensions.getExtension("redhat.java");
		if (!java?.activate()) {
			return [];
		}

		return [];
	}
}