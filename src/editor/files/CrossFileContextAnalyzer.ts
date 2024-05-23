import { LRUCache } from "lru-cache";
import { noop, reverse, uniqBy } from "lodash";

import { channel } from "../../channel";
import { SymbolSignatureReader } from "./SymbolSignatureReader";
import { SymbolLinkResolver } from "./SymbolLinkResolver";
import { serializePosition } from "../language/base/position";
import {
  IDocumentSymbol,
  ILocationLink,
  IRange,
} from "../language/base/languages";
import { inferLanguage } from "../language/SupportedLanguage";

type TargetDefinition = {
  uri: string;
  range: IRange;
  documentSymbol: IDocumentSymbol;
};

interface ReferencedSymbolsDto extends ILocationLink {
  targetDefinition: TargetDefinition;
}

interface WorkspaceSymbolsDto {
  timestamp: number;
  inFlight: boolean;
  symbols: ReferencedSymbolsDto[];
}

export interface NeighborSnippet {
  relevantFile: string;
  snippet: string;
}

export class CrossFileContextAnalyzer {
  private symbolLinkResolver = new SymbolLinkResolver();

  private symbolSignatureReader = new SymbolSignatureReader({
    maxFileLimit: 50,
    maxSymbolsLimit: 100,
  });

  private referencedSymbolsCache = new LRUCache<string, WorkspaceSymbolsDto>({
    max: 50,
  });

  private analyzerThrottleTime = 20000;

  getReferencedSymbolsContextFromCache(path: string, offset: number) {
    return this.resolveReferencedSnippets(
      this.analyzeReferencedSymbolsCached(path),
      offset
    );
  }

  async resolveReferencedSnippets(
    symbols: ReferencedSymbolsDto[],
    offset: number
  ): Promise<NeighborSnippet[]> {
    const uniqueSymbols = uniqBy(
      reverse(
        symbols.filter(
          (item) => !!item.targetDefinition && item.originEndOffset <= offset
        )
      ),
      (item) => item.targetUri + "-" + serializePosition(item.targetRange.start)
    );

    const signTextList = uniqueSymbols.map((item) => {
      const signature = this.symbolSignatureReader.stringifySignature(
        item.targetDefinition.documentSymbol
      );

      return signature;
    });

    return uniqueSymbols.map((item, index) => {
      return {
        relevantFile: item.targetUri,
        snippet: signTextList[index],
      };
    });
  }

  analyzeReferencedSymbolsCached(path: string) {
    let item = this.referencedSymbolsCache.get(path);

    if (!item) {
      item = {
        timestamp: -1,
        inFlight: false,
        symbols: [],
      };
    }

    if (
      !item.inFlight &&
      Date.now() - item.timestamp > this.analyzerThrottleTime
    ) {
      item.timestamp = Date.now();
      item.inFlight = true;

      this.analyzeReferencedSymbols(path)
        .then((symbols) => (item.symbols = symbols), noop)
        .finally(() => (item.inFlight = false));
    }

    return item.symbols;
  }

  async analyzeReferencedSymbols(
    path: string
  ): Promise<ReferencedSymbolsDto[]> {
    const t0 = performance.now();

    // TODO 获取本地变量
    const [imports, assignments] = await Promise.all([
      this.symbolLinkResolver.resolveImports(path, 30),
      this.symbolLinkResolver.resolveAssignments(path, 70),
    ]);

    const links = [...imports, ...assignments];
    const t1 = performance.now();

    channel.debug(
      "(CrossFileContextAnalyzer): " +
        (t1 - t0).toFixed(2) +
        "ms to resolve symbol links"
    );

    const definitions: TargetDefinition[] = [];
    for (const link of this.getLinksToResolve(links)) {
      const documentSymbol = await this.symbolSignatureReader
        .getSignature(link.targetUri, link.targetRange)
        .catch(noop);

      if (documentSymbol) {
        definitions.push({
          uri: link.targetUri,
          range: link.targetRange,
          documentSymbol,
        });
      }
    }

    channel.debug(
      "(CrossFileContextAnalyzer): " +
        (performance.now() - t1).toFixed(2) +
        "ms to resolve documentSymbols"
    );

    const linkedMap = new Map<string, TargetDefinition>(
      definitions.map((link) => [
        link.uri + "-" + serializePosition(link.range.start),
        link,
      ])
    );

    return links.map((link): ReferencedSymbolsDto => {
      const targetDefinition = linkedMap.get(
        link.targetUri + "-" + serializePosition(link.targetRange.start)
      )!;

      return {
        ...link,
        targetDefinition,
      };
    });
  }

  getLinksToResolve(links: ILocationLink[]): ILocationLink[] {
    return [];
  }

  shouldKeepLocationLink(link: ILocationLink) {
    return false;
  }

  dispose() {
    this.referencedSymbolsCache.clear();
    this.symbolSignatureReader.dispose();
  }
}
