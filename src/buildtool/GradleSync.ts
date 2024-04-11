import { extensions } from "vscode";
import { PackageDependencies } from "./DependenceInfo";

export class GradleSync {
	findDeps(): PackageDependencies[] {
		let java = extensions.getExtension("redhat.java");
		if (!java?.activate()) {
			return [];
		}

		return [];
	}
}
