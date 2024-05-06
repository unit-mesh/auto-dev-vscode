import { injectable } from "inversify";

import { RelatedCodeProvider } from "../_base/RelatedCodeProvider";
import { CodeFile, CodeFunction, CodeStructure } from "../../editor/codemodel/CodeFile";
import { CodeFileCacheManager } from "../../editor/cache/CodeFileCacheManager";
import { channel } from "../../channel";

type JavaType = string;
type CanonicalName = string;

@injectable()
export class JavaRelatedProvider implements RelatedCodeProvider {
	name = "JavaRelatedProvider";
	language = "java";

	JAVA_BUILTIN_TYPES = new Set([
		"byte", "short", "int", "long", "float", "double", "boolean", "char", "void"
	]);

	// dynamic get resources
	importCache: Map<JavaType, CanonicalName> = new Map();
	private fileManager: CodeFileCacheManager | undefined;

	constructor() {
	}

	async setFileManager(fileManager: CodeFileCacheManager) {
		this.fileManager = fileManager;
	}

	async inputAndOutput(file: CodeFile, method: CodeFunction): Promise<CodeStructure[]> {
		// split type and check in imports
		const maybeRelated = file.imports.filter(imp => {
			const parts = imp.split(".");
			const type = parts[parts.length - 1];
			if (type === method.returnType) {
				this.importCache.set(type, imp);
				return true;
			}
			return false;
		});

		channel.append(`maybe related element: ${maybeRelated}\n`);

		// check import in fileManager
		const relatedFiles: Promise<CodeStructure>[] = maybeRelated.map(async imp => {
			return this.fileManager!!.getRecentlyStructure(imp, "java");
		});

		return Promise.all(relatedFiles);
	}
}