import * as vscode from "vscode";
import { extractMarkdownCodeBlockContent } from "../../code-search/chunk/MarkdownChunker";
import { LRUCache } from "lru-cache";

import { getDocumentSymbol, isDocumentSymbol } from "../language/base/documentSymbol";
import { getMidPosition, serializePosition } from "../language/base/position";
import { IDocumentSymbol, IRange } from "../language/base/languages";
import { timeoutSafe } from "../util/timeout";
import { inferLanguage } from "../language/SupportedLanguage";
import { adaptSymbolKind } from "../language/base/symbolKind";

export type SymbolSignatureReadConfig = {
	maxFileLimit: number;
	maxSymbolsLimit: number;
};

export class SymbolSignatureReader {
	private disposables: vscode.Disposable[] = [];
	private documentSymbolsCache: LRUCache<
		string,
		vscode.DocumentSymbol[] | vscode.SymbolInformation[]
	>;
	private signaturesCache: LRUCache<string, LRUCache<string, IDocumentSymbol>>;

	constructor(private config: SymbolSignatureReadConfig) {
		this.documentSymbolsCache = new LRUCache({ max: config.maxFileLimit });
		this.signaturesCache = new LRUCache({ max: config.maxFileLimit });

		this.disposables.push(
			vscode.workspace.onDidChangeTextDocument((event) => {
				if (event.contentChanges.length > 0) {
					const path = event.document.uri.path;

					if (this.documentSymbolsCache.has(path)) {
						this.documentSymbolsCache.delete(path);
					}

					if (this.signaturesCache.has(path)) {
						this.signaturesCache.delete(path);
					}
				}
			})
		);
	}

	async getSignature(filename: string, range: IRange) {
		const uri = vscode.Uri.file(filename);
		const pos = serializePosition(range.start);
		const signaturesCache = this.signaturesCache;

		const existing = signaturesCache.get(uri.path)?.get(pos);
		if (existing) return existing;

		const documentSymbol = getDocumentSymbol(
			await timeoutSafe(this.getDocumentSymbols(uri), 3000, []),
			getMidPosition(range)
		);

		const languageId = inferLanguage(filename);

		const structured = documentSymbol
			? await this.getStructuredSignatureHelper(uri, documentSymbol, languageId)
			: void 0;

		if (!structured) return;

		if (!signaturesCache.has(uri.path)) {
			signaturesCache.set(
				uri.path,
				new LRUCache({ max: this.config.maxSymbolsLimit })
			);
		}

		const cacheStore = signaturesCache.get(uri.path);

		if (cacheStore) {
			cacheStore.set(pos, structured);
		}

		return structured;
	}

	async getDocumentSymbols(
		uri: vscode.Uri
	): Promise<vscode.DocumentSymbol[] | vscode.SymbolInformation[]> {
		const cache = this.documentSymbolsCache;
		if (cache.has(uri.path)) return cache.get(uri.path)!;

		const documentSymbols = await vscode.commands.executeCommand<
			vscode.DocumentSymbol[] | vscode.SymbolInformation[]
		>("vscode.executeDocumentSymbolProvider", uri);

		if (!documentSymbols) {
			return []
		}

		cache.set(uri.path, documentSymbols);

		return documentSymbols;
	}

	async getStructuredSignatureHelper(
    path: vscode.Uri,
		documentSymbol: vscode.DocumentSymbol,
		languageId?: string
	) {
		const signature = await this.getSymbolSignature(path, documentSymbol);
		if (!signature) return;

		const structure: IDocumentSymbol = {
			name: documentSymbol.name,
			kind: adaptSymbolKind(documentSymbol.kind),
			content: signature,
			children: [],
		};

		if (
			isDocumentSymbol(documentSymbol) &&
			documentSymbol.kind === vscode.SymbolKind.Class
		) {
			const documentSymbols = documentSymbol.children.filter(
				(item) =>
					"python" !== languageId ||
					"__init__" === item.name ||
					!item.name.startsWith("_")
			);

			for (const childSymbol of documentSymbols) {
				const signature = await this.getSymbolSignature(path, childSymbol);
				if (signature) {
					structure.children.push({
						name: childSymbol.name,
						kind: adaptSymbolKind(childSymbol.kind),
						content: signature,
						children: [],
					});
				}
			}
		}
		return structure;
	}

	async getSymbolSignature(
    uri: vscode.Uri,
    symbol: vscode.DocumentSymbol | vscode.SymbolInformation,
	) {
		const position = isDocumentSymbol(symbol)
			? symbol.selectionRange.start
			: symbol.location.range.start;

		const hovers = await this.getHovers(uri, position);

		const content = hovers[0]?.contents[0];
		if (!content) return;

		const text = "string" == typeof content ? content : content.value;
		return text ? extractMarkdownCodeBlockContent(text)[0] : undefined;
	}

	async getHovers(
		uri: vscode.Uri,
		position: vscode.Position
	): Promise<vscode.Hover[]> {
		const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
			"vscode.executeHoverProvider",
			uri,
			position
		);

		return hovers || [];
	}

  stringifySignature(documentSymbol: IDocumentSymbol, languageId?: string) {
    return [
      documentSymbol.content,
      ...documentSymbol.children.map(child => child.content),
    ].join('\n');
  }

  dispose() {
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables = [];
  }
}
