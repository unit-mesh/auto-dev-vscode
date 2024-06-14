/* eslint-disable curly */
import * as vscode from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';
import { isFileTooLarge } from 'base/common/files/files';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { logger } from 'base/common/log/log';

import { AutoDevExtension } from '../../AutoDevExtension';

// Skipping contexts that are too short
// '// 写一个合计函数' => 10
// 'export const' => 12
// 'export const sum =' => 18
// 'export function' => 15
const MIN_CONTEXT_LENGTH = 12;

const BEFORE_CURSOR = '<|fim_prefix|>';
const AFTER_CURSOR = '<|fim_suffix|>';
const AT_CURSOR = '<|fim_middle|>';
const FILE_SEPARATOR = '<|file_separator|>';

const CODE_STOR_WORDS = [
	BEFORE_CURSOR,
	AFTER_CURSOR,
	AT_CURSOR,
	FILE_SEPARATOR,
	'<|end▁of▁sentence|>',
	'<|EOT|>',
	'\\n',
	'<|eot_id|>',
];

const CODE_PROMPT_TEMPLATE = `${BEFORE_CURSOR}{prefix}${AFTER_CURSOR}{suffix}${AT_CURSOR}`;

export class AutoDevCodeInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
	private configService: ConfigurationService;
	private lm: LanguageModelsService;

	constructor(extension: AutoDevExtension) {
		this.configService = extension.config;
		this.lm = extension.lm;
	}

	// TODO: Whether the smart processing is triggered after the complement or for the first time
	async provideInlineCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken,
	): Promise<vscode.InlineCompletionItem[]> {
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

		const result = await this.sendRequest(document, position, context, token);

		if (result) {
			return [new vscode.InlineCompletionItem(result.trimStart())];
		}

		return [];
	}

	async sendRequest(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken,
	): Promise<string | undefined> {
		const version = document.version;
		const offset = document.offsetAt(position);

		if (token.isCancellationRequested) {
			logger.debug('(inline completions): vscode cancelled');
			return;
		}

		if (version !== undefined && document.version !== version) {
			logger.debug('(inline completions): document was changed when preparing the completion request');
			return;
		}

		const content = document.getText().trim();
		const { prefix, suffix } = extractDocPrompt(content, offset);

		const template = this.configService.get<string>('completions.template', CODE_PROMPT_TEMPLATE);

		const prompt = template
			.replace('{language}', document.languageId)
			.replace('{file_name}', document.fileName)
			.replace('{prefix}', prefix)
			.replace('{suffix}', suffix);

		const t0 = performance.now();
		const llm = this.lm;

		// TODO support stream
		const completion = await llm.completion(
			prompt,
			{
				temperature: 0.4,
				topP: 0.2,
				frequencyPenalty: 1.1,
				stop: this.configService.get<string[]>('completions.stops', CODE_STOR_WORDS),
			},
			undefined,
			token,
		);

		logger.debug(
			`(inline completions): Code stream finished in ${(performance.now() - t0).toFixed(
				2,
			)} ms with contents: ${completion}`,
		);

		return completion;
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
	const contentArr = content.split('\n');
	const lastLine = contentArr[contentArr.length - 1];
	const length = lastLine.length - lastLine.trimEnd().length;

	const prefix = content.slice(0, content.length - length);
	const trailingWs = content.slice(prefix.length);

	return lastLine.length === length ? [prefix, trailingWs] : [content, ''];
}
