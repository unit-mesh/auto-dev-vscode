export interface LlmConfig {
	provider?: 'anthropic' | 'openai' | 'qianfan' | 'tongyi';
	apiType?: string;
	baseURL?: string;
	apiKey?: string;
	secretKey?: string // Baidu only
	organization?: string;
	project?: string; // OpenAI only
	model?: string;
	enableSearch?: boolean; // Tongyi only
}