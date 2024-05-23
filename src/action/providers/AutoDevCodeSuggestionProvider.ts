import * as vscode from "vscode";
import { LRUCache } from "lru-cache";

import { channel } from "../../channel";
import { CrossFileContextAnalyzer } from "../../editor/files/CrossFileContextAnalyzer";
import { SettingService } from "../../settings/SettingService";

const MIN_CONTEXT_LENGTH = 15;

interface ReferencedSymbolsDto {
	name: string;
	uri: string;
}

interface WorkspaceSymbolsDto {
	timestamp: number;
	inFlight: boolean;
	symbols: ReferencedSymbolsDto[];
}

export class AutoDevCodeSuggestionProvider
	implements vscode.InlineCompletionItemProvider
{
	crossFileContextAnalyzer = new CrossFileContextAnalyzer();

	referencedSymbolsCache = new LRUCache<string, WorkspaceSymbolsDto>({
		max: 50,
	});

	config = SettingService.instance()

	async provideInlineCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken
	): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
		if (!this.config.get('suggestion.enableCodeCompletion')) return []

		if (document.lineCount >= 8000) {
			channel.debug("skip long file");
			return [];
		}

		const isMiddleOfTheLine = isValidMiddleOfTheLine(document, position);
		if (!isMiddleOfTheLine) {
			channel.debug("invalid middle of the line");
			return [];
		}

		if (document.getText().trim().length < MIN_CONTEXT_LENGTH) {
			channel.debug("not enough context");
			return [];
		}

		return this.getInlineCompletions(document, position, context, token);
	}

	async getInlineCompletions(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken
	) {
		const version = document.version;
		const offset = document.offsetAt(position);

		const [snippets, info] = await Promise.all([
			this.resolveNeighborSnippets(document, token, offset),
			this.resolveCompletionContext(document, position, context),
		]);

		if (token.isCancellationRequested) {
			channel.debug("vscode cancelled");
			return [];
		}

		if (version !== undefined && document.version !== version) {
			channel.debug(
				"document was changed when preparing the completion request"
			);
			return [];
		}

		const content = document.getText();
		const prompt = extractDocPrompt(content, offset);

		console.log(prompt, snippets, info);

		return [];
	}

	async resolveNeighborSnippets(
		document: vscode.TextDocument,
		token: vscode.CancellationToken,
		offset: number
	) {
		try {
			const references =
				await this.crossFileContextAnalyzer.getReferencedSymbolsContextFromCache(
					document.uri.toString(),
					offset
				);

			if (token.isCancellationRequested) return;

			channel.debug(
				"(context):",
				(references ? references.length : 0) + " references symbols"
			);

			let count = 0;
			let lastIndex = 0;

			for (const reference of references) {
				count += reference.snippet.length;
				if (count > 4000) break;
				lastIndex++;
			}

			return references.slice(0, lastIndex);
		} catch (error) {
			channel.debug((error as Error).message);
			channel.info("(context): NeighborSnippets failed to retrieve context");
		}
	}

	async resolveCompletionContext(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext
	) {
		const { selectedCompletionInfo } = context;

		if (!selectedCompletionInfo) return;

		const { text, range } = selectedCompletionInfo;

		const prefix = document.getText(
			new vscode.Range(new vscode.Position(0, 0), range.start)
		);

		const suffix = document.getText(
			new vscode.Range(range.end, new vscode.Position(document.lineCount, 0))
		);

		return {
			content: prefix + text + suffix,
			row: range.end.line + 1,
			col: range.start.character + text.length + 1,
			addedPrefix: text.slice(position.character - range.start.character),
		};
	}

	dispose() {
		this.crossFileContextAnalyzer.dispose()
		this.referencedSymbolsCache.clear()
	}
}

function extractDocPrompt(content: string, offset: number) {
	const head = content.slice(0, offset);
	const suffix = content.slice(offset);
	const [prefix, trailingWs] = trimLastLine(head);

	return {
		prefix: prefix,
		suffix: suffix,
		isFimEnabled: false,
		trailingWs: trailingWs,
	};
}

function isValidMiddleOfTheLine(
	document: vscode.TextDocument,
	position: vscode.Position
) {
	const content = document
		.lineAt(position)
		.text.slice(position.character)
		.trim();

	return /^\s*[)}\]"'"]*\s*[:{;,]?\s*$/.test(content);
}

function trimLastLine(content: string): [string, string] {
	const contentArr = content.split("\n");
	const lastLine = contentArr[contentArr.length - 1];
	const length = lastLine.length - lastLine.trimEnd().length;

	const prefix = content.slice(0, content.length - length);
	const trailingWs = content.slice(prefix.length);

	return lastLine.length === length ? [prefix, trailingWs] : [content, ""];
}
