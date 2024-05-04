import { TreeSitterFile } from "../code-context/ast/TreeSitterFile";
import { NamedElementBuilder } from "../editor/ast/NamedElementBuilder";

export function TestOnly(target: typeof NamedElementBuilder, propertyKey: "fromFile", descriptor: TypedPropertyDescriptor<(file: TreeSitterFile) => Promise<NamedElementBuilder>>): void | TypedPropertyDescriptor<(file: TreeSitterFile) => Promise<NamedElementBuilder>> {
	throw new Error("Function not implemented.");
}