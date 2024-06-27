/* eslint-disable curly */
import * as vscode from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';
import { isFileTooLarge } from 'base/common/files/files';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { logger } from 'base/common/log/log';
import { showErrorMessage } from 'base/common/messages/messages';

import { AutoDevExtension } from '../../AutoDevExtension';

// Skipping contexts that are too short
// '// 写一个合计函数' => 10
// 'export const' => 12
// 'export const sum =' => 18
// 'export function' => 15
const MIN_CONTEXT_LENGTH = 12;

// see https://github.com/QwenLM/CodeQwen1.5/blob/b082fc3f5302cb6a63efa8fcc9dbf572a3c2303e/examples/CodeQwen1.5-base-fim.py#L8
// see https://ollama.com/blog/how-to-prompt-code-llama
// see https://ai.google.dev/gemma/docs/formatting
const FIM_PREFIX_TOKEN = '<|fim_prefix|>';
const FIM_SUFFIX_TOKEN = '<|fim_suffix|>';
const FIM_MIDDLE_TOKEN = '<|fim_middle|>';

const CODE_STOR_WORDS = [
	'<|endoftext|>', // Code Qwen
	// Code Gemma
	'<|file_separator|>',
	// Code Llama
	'<|EOF|>',
	'<EOT>',
	// Other
	';',
];

// TODO support repo level fim tokens
type FIMSpecialTokens = {
	prefix: string;
	suffix: string;
	middle: string;
};

export class AutoDevCodeInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
	private configService: ConfigurationService;
	private lm: LanguageModelsService;

	constructor(extension: AutoDevExtension) {
		this.configService = extension.config;
		this.lm = extension.lm;
	}

	async provideInlineCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken,
	): Promise<vscode.InlineCompletionItem[]> {
		// Note: Some users then use local or self-hosted services.
		// which is overly burdensome for the average user if "automatic" mode is supported
		if (context.triggerKind !== vscode.InlineCompletionTriggerKind.Automatic) {
			return [];
		}

		const config = this.configService;

		if (!config.get('completions.enable')) {
			return [];
		}

		if (isFileTooLarge(document)) {
			logger.debug('(inline completions): skip long file');
			return [];
		}

		if (document.getText().trim().length < MIN_CONTEXT_LENGTH) {
			logger.debug('(inline completions): not enough context');
			return [];
		}

		const requestDelay = config.get<number>('completions.requestDelay', 500);

		await new Promise<void>(resolve => {
			const timerId = setTimeout(resolve, requestDelay);

			token.onCancellationRequested(() => {
				clearTimeout(timerId);
				resolve();
			});
		});

		if (token.isCancellationRequested) {
			logger.debug('(inline completions): during debounce');
			return [];
		}

		const version = document.version;

		const t0 = performance.now();

		try {
			const result = await this.sendRequest(document, position, context, token);

			logger.debug(
				`(inline completions): Generated finished in ${(performance.now() - t0).toFixed(2)} ms with contents: ${result}`,
			);

			// if (token.isCancellationRequested) {
			// 	logger.debug('(inline completions): vscode cancelled');
			// 	return [];
			// }

			if (version !== undefined && document.version !== version) {
				logger.debug('(inline completions): document was changed when preparing the completion request');
				return [];
			}

			if (result) {
				return [new vscode.InlineCompletionItem(result.trimStart())];
			}
		} catch (error) {
			if (!token.isCancellationRequested) {
				logger.error(`(inline completions): ${error}`);
				showErrorMessage('Inline Completion Error');
			}
		}

		return [];
	}

	// TODO: support infill mode
	async sendRequest(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken,
	): Promise<string | undefined> {
		const offset = document.offsetAt(position);

		const content = document.getText().trim();
		const { prefix, suffix } = extractDocPrompt(content, offset);

		return this.completion(prefix, suffix, document, token);
	}

	completion(
		prefix: string,
		suffix: string,
		document: vscode.TextDocument,
		token: vscode.CancellationToken,
	): Promise<string> {
		const config = this.configService;

		const template = config.get<string>('completions.template');

		// NOTE: For ease of configuration, it will not be merged with parameters
		const userWords = config.get<string[]>('completions.stops', []);

		const parameters = config.get<{
			temperature: number;
			top_p: number;
			max_tokens: number;
		}>('completions.parameters', {
			temperature: 0,
			top_p: 0.9,
			max_tokens: 800,
		});

		const stop = [...CODE_STOR_WORDS, ...userWords];

		let prompt: string;
		if (template) {
			prompt = template
				.replace('{language}', document.languageId)
				.replace('{file_name}', document.fileName)
				.replace('{prefix}', prefix)
				.replace('{suffix}', suffix);
		} else {
			const fimSpecialTokens = config.get<FIMSpecialTokens>('completions.fimSpecialTokens', {
				prefix: FIM_PREFIX_TOKEN,
				suffix: FIM_SUFFIX_TOKEN,
				middle: FIM_MIDDLE_TOKEN,
			});

			prompt = formatCompletionPrompt(prefix, suffix, fimSpecialTokens, document.languageId !== 'python');
			stop.push(fimSpecialTokens.prefix, fimSpecialTokens.suffix, fimSpecialTokens.middle);
		}

		logger.debug(`(inline completions): prompt: ${prompt}`);

		return this.lm.completion(
			prompt,
			{
				stream: false,
				...parameters,
				stop: stop,
			},
			undefined,
			token,
		);
	}
}

function formatCompletionPrompt(prefix: string, suffix: string, tokens: FIMSpecialTokens, trimSpace?: boolean) {
	// if (trimSpace) {
	// 	return `${tokens.prefix} ${prefix.trim()} ${tokens.suffix} ${suffix.trim()} ${tokens.middle}`;
	// }

	return `${tokens.prefix}${prefix}${tokens.suffix}${suffix}${tokens.middle}`;
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
	const contentArr = content.split('\n');
	const lastLine = contentArr[contentArr.length - 1];
	const length = lastLine.length - lastLine.trimEnd().length;

	const prefix = content.slice(0, content.length - length);
	const trailingWs = content.slice(prefix.length);

	return lastLine.length === length ? [prefix, trailingWs] : [content, ''];
}
