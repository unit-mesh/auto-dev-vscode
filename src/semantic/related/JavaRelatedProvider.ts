import { RelatedProvider } from "./RelatedProvider";
import { CodeFile, CodeFunction, CodeStructure } from "../../codemodel/CodeFile";
import { CodeFileCacheManager } from "../../cache/CodeFileCacheManager";

const JAVA_BUILTIN_TYPES = new Set([
	"byte", "short", "int", "long", "float", "double", "boolean", "char", "void"
]);

// typealias for Java types
type JavaType = string;
type CanonicalName = string;

export class JavaRelatedProvider implements RelatedProvider {
	// dynamic get resources
	importCache: Map<JavaType, CanonicalName> = new Map();
	private fileManager: CodeFileCacheManager | undefined;

	constructor(fileManager?: CodeFileCacheManager) {
		this.fileManager = fileManager;
	}

	inputOutputs(file: CodeFile, method: CodeFunction): CodeStructure[] {
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

		// check import in fileManager
		const relatedFiles = maybeRelated.map(imp => {
				return this.fileManager?.getStructureByCanonicalName(imp);
		})
			.filter((value): value is CodeStructure => value !== undefined);

		return relatedFiles;
	}
}