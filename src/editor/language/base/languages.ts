import { SymbolKind } from "./symbolKind";

export type IPosition = {
  line: number;
  character: number;
};

export type IRange = {
  start: IPosition;
  end: IPosition;
};

export type ILocation = {
  uri: string;
  range: IRange;
};

export type ILocationLink = {
  name: string;
  originUri: string;
  originRange: IRange;
  originStartOffset: number;
  originEndOffset: number;
  targetUri: string;
  targetRange: IRange;
};

export type ISymbolInformation = {
  name: string;
  range: IRange;
  startOffset: number;
  endOffset: number;
};

export type IDocumentSymbol = {
  name: string;
  kind: SymbolKind | null;
  content: string;
  children: IDocumentSymbol[];
};

export type ReferencedSymbolItem = {
  timestamp: number;
  inFlight: boolean;
  symbols: ILocationLink[];
};
