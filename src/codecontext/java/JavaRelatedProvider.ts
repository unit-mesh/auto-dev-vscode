import { RelatedCodeProvider } from "../_base/RelatedCodeProvider";
import { CodeFile, CodeFunction, CodeStructure } from "../../editor/codemodel/CodeFile";
import { CodeFileCacheManager } from "../../editor/cache/CodeFileCacheManager";
import { channel } from "../../channel";

const JAVA_BUILTIN_TYPES = new Set([
	"byte", "short", "int", "long", "float", "double", "boolean", "char", "void"
]);

// typealias for Java types
type JavaType = string;
type CanonicalName = string;

export class JavaRelatedProvider extends RelatedCodeProvider {
	// dynamic get resources
	importCache: Map<JavaType, CanonicalName> = new Map();
	private fileManager: CodeFileCacheManager | undefined;

	constructor(fileManager?: CodeFileCacheManager) {
		super();
		this.fileManager = fileManager;
	}

	async inputOutputs(file: CodeFile, method: CodeFunction): Promise<CodeStructure[]> {
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