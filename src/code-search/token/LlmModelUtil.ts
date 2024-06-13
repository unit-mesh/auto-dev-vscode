type TemplateType =
	| 'llama2'
	| 'alpaca'
	| 'zephyr'
	| 'phi2'
	| 'phind'
	| 'anthropic'
	| 'chatml'
	| 'none'
	| 'openchat'
	| 'deepseek'
	| 'xwin-coder'
	| 'neural-chat'
	| 'codellama-70b'
	| 'llava'
	| 'gemma';

export function autodetectTemplateType(model: string): TemplateType | undefined {
	const lower = model.toLowerCase();

	if (lower.includes('codellama') && lower.includes('70b')) {
		return 'codellama-70b';
	}

	if (
		lower.includes('gpt') ||
		lower.includes('command') ||
		lower.includes('chat-bison') ||
		lower.includes('pplx') ||
		lower.includes('gemini')
	) {
		return undefined;
	}

	if (lower.includes('llava')) {
		return 'llava';
	}

	if (lower.includes('tinyllama')) {
		return 'zephyr';
	}

	if (lower.includes('xwin')) {
		return 'xwin-coder';
	}

	if (lower.includes('dolphin')) {
		return 'chatml';
	}

	if (lower.includes('gemma')) {
		return 'gemma';
	}

	if (lower.includes('phi2')) {
		return 'phi2';
	}

	if (lower.includes('phind')) {
		return 'phind';
	}

	if (lower.includes('llama')) {
		return 'llama2';
	}

	if (lower.includes('zephyr')) {
		return 'zephyr';
	}

	// Claude requests always sent through Messages API, so formatting not necessary
	if (lower.includes('claude')) {
		return 'none';
	}

	if (lower.includes('alpaca') || lower.includes('wizard')) {
		return 'alpaca';
	}

	if (lower.includes('mistral') || lower.includes('mixtral')) {
		return 'llama2';
	}

	if (lower.includes('deepseek')) {
		return 'deepseek';
	}

	if (lower.includes('ninja') || lower.includes('openchat')) {
		return 'openchat';
	}

	if (lower.includes('neural-chat')) {
		return 'neural-chat';
	}

	return 'chatml';
}
