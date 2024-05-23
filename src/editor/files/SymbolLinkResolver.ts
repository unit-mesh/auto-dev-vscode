import { timeoutSafe } from '../util/timeout';
import { ILocationLink } from '../language/base/languages';
import { BasedSymbolUsageFinder } from './BasedSymbolUsageFinder';
import { LocationLinkResolver } from './LocationLinkResolver';

export class SymbolLinkResolver {
  constructor(
    private symbolUsageResolver: BasedSymbolUsageFinder,
    private locationLinkResolver: LocationLinkResolver,
  ) {}

  async resolveImports(path: string, maxLines: number) {
    const t0 = performance.now();
    const importedSymbols =
      await this.symbolUsageResolver.findImportedSymbols(path);

    console.info(
      '(context): ' +
        importedSymbols.length +
        ' imported symbols found in ' +
        (performance.now() - t0).toFixed(0x2) +
        'ms',
    );

    const imports: ILocationLink[] = [];
    for (const symbol of importedSymbols.slice(0, maxLines)) {
      const typeDefinition = await timeoutSafe(
        this.locationLinkResolver.resolveTypeDefinition(path, symbol.range),
      );

      if (typeDefinition) {
        imports.push({
          name: symbol.name,
          originUri: path,
          originRange: symbol.range,
          originStartOffset: symbol.startOffset,
          originEndOffset: symbol.endOffset,
          targetUri: typeDefinition.uri,
          targetRange: typeDefinition.range,
        });
      }
    }

    return imports;
  }
}
