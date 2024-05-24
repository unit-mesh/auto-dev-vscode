/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import * as vscode from "vscode";

import { channel } from "../../channel";
import { CrossFileContextAnalyzer } from "../../editor/files/CrossFileContextAnalyzer";
import { SettingService } from "../../settings/SettingService";
import { LlmProvider } from "../../llm-provider/LlmProvider";

const MIN_CONTEXT_LENGTH = 6;

const CODE_PROMPT_TEMPLATE = `<fim_prefix>{prefix}<fim_suffix>{suffix}<fim_middle>`;

const CODE_STOR_WORDS = [
  "<｜end▁of▁sentence｜>",
  "<｜EOT｜>",
  "\\n",
  "<|eot_id|>",
];

export class AutoDevCodeSuggestionProvider
  implements vscode.InlineCompletionItemProvider
{
  crossFileContextAnalyzer = new CrossFileContextAnalyzer();

  config = SettingService.instance();

  // TODO: Whether the smart processing is triggered after the complement or for the first time
  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[]> {
    const config = this.config;

    if (!config.get("suggestion.enableCodeCompletion")) return [];

    if (document.lineCount >= 8000) {
      channel.debug("(AutoDevCodeSuggestionProvider): skip long file");
      return [];
    }

    if (document.getText().length < MIN_CONTEXT_LENGTH) {
      channel.debug("(AutoDevCodeSuggestionProvider): not enough context");
      return [];
    }

    const requestDelay = config.get<number>("completion.requestDelay", 500);

    await new Promise<void>((resolve) => {
      const timerId = setTimeout(resolve, requestDelay);

      token.onCancellationRequested(() => {
        clearTimeout(timerId);
        resolve();
      });
    });

    if (token.isCancellationRequested) {
      channel.debug("(AutoDevCodeSuggestionProvider): during debounce");
      return [];
    }

    const result = await this.codeCompletion(
      document,
      position,
      context,
      token
    );

    if (result) {
      return [new vscode.InlineCompletionItem(result.trimStart())];
    }

    return [];
  }

  async codeCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<string | undefined> {
    const version = document.version;
    const offset = document.offsetAt(position);

    const snippets = await this.resolveNeighborSnippets(
      document,
      token,
      offset
    );

    if (token.isCancellationRequested) {
      channel.debug("(AutoDevCodeSuggestionProvider): vscode cancelled");
      return;
    }

    if (version !== undefined && document.version !== version) {
      channel.debug(
        "(AutoDevCodeSuggestionProvider): document was changed when preparing the completion request"
      );
      return;
    }

    const content = document.getText().trim();
    const { prefix, suffix } = extractDocPrompt(content, offset);

    const template =
      this.config.get<string>("completion.template") || CODE_PROMPT_TEMPLATE;

    const prompt = template
      .replace(
        "{additionalContext}",
        snippets ? JSON.stringify(snippets) : "[]"
      )
      .replace("{language}", document.languageId)
      .replace("{prefix}", prefix)
      .replace("{suffix}", suffix);

    return this.createCodeCompletion(prompt, token);
  }

  async createCodeCompletion(prompt: string, token: vscode.CancellationToken) {
    if (this.config.get<boolean>("completion.enableLegacyMode") === true) {
      return this.sendLegacyCodeCompletionRequest(prompt, token);
    }

    return this.sendCodeCompletionRequest(prompt, token);
  }

  async sendCodeCompletionRequest(
    prompt: string,
    token: vscode.CancellationToken
  ): Promise<string | undefined> {
    const t0 = performance.now();
    const llm = LlmProvider.codeCompletion();

    const ac = new AbortController();

    token.onCancellationRequested(() => {
      ac.abort();
    });

    const completion = await llm.complete(
      prompt,
      {
        temperature: 0.4,
        topP: 0.2,
        frequencyPenalty: 1.1,
        stop: this.config.get<string[]>("completion.stops") || CODE_STOR_WORDS,
      },
      ac.signal
    );

    if (token.isCancellationRequested || ac.signal.aborted) {
      channel.debug("(AutoDevCodeSuggestionProvider): vscode cancelled");
      return;
    }

    channel.debug(
      `(AutoDevCodeSuggestionProvider): Code stream finished in ${(
        performance.now() - t0
      ).toFixed(2)} ms with contents: ${completion}`
    );

    return completion;
  }

  async sendLegacyCodeCompletionRequest(
    prompt: string,
    token: vscode.CancellationToken
  ): Promise<string | undefined> {
    const t0 = performance.now();
    const llm = LlmProvider.codeCompletion();

    const ac = new AbortController();

    token.onCancellationRequested(() => {
      ac.abort();
    });

    const completion = await llm.createCompletion(
      {
        stream: false,
        prompt,
        temperature: 0.4,
        top_p: 0.2,
        frequency_penalty: 1.1,
        stop: this.config.get<string[]>("completion.stops") || CODE_STOR_WORDS,
      },
      ac.signal
    );

    if (token.isCancellationRequested || ac.signal.aborted) {
      channel.debug("(AutoDevCodeSuggestionProvider): vscode cancelled");
      return;
    }

    const content = completion?.choices[0]?.text;

    channel.debug(
      `(AutoDevCodeSuggestionProvider): Code stream finished in ${(
        performance.now() - t0
      ).toFixed(2)} ms with contents: ${content}`
    );

    return content;
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
        "(AutoDevCodeSuggestionProvider):",
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
      channel.error(
        `(AutoDevCodeSuggestionProvider): NeighborSnippets failed to retrieve context: ${
          (error as Error).message
        }`
      );
    }
  }

  dispose() {
    this.crossFileContextAnalyzer.dispose();
  }
}

function extractDocPrompt(content: string, offset: number) {
  const head = content.slice(0, offset);
  const suffix = content.slice(offset);
  const [prefix, trailingWs] = trimLastLine(head);

  return {
    prefix: prefix,
    suffix: suffix,
    trailingWs: trailingWs,
  };
}

function trimLastLine(content: string): [string, string] {
  const contentArr = content.split("\n");
  const lastLine = contentArr[contentArr.length - 1];
  const length = lastLine.length - lastLine.trimEnd().length;

  const prefix = content.slice(0, content.length - length);
  const trailingWs = content.slice(prefix.length);

  return lastLine.length === length ? [prefix, trailingWs] : [content, ""];
}
