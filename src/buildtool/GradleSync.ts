import { extensions } from "vscode";
import { PackageDependencies } from "./DependenceInfo.ts";

export class GradleSync {
	findDeps(): PackageDependencies[] {
		let java = extensions.getExtension("redhat.java");
		if (!java?.activate()) {
			return [];
		}

		return [];
	}
}