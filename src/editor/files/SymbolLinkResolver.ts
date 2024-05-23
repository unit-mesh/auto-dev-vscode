import { ILocationLink } from "../language/base/languages";

export class SymbolLinkResolver {
  // TODO
  async resolveImports(
    path: string,
    maxSize: number
  ): Promise<ILocationLink[]> {
    return [];
  }

  // TODO
  async resolveAssignments(
    path: string,
    maxSize: number
  ): Promise<ILocationLink[]> {
    return [];
  }
}
