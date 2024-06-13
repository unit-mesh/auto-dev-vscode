export interface TemplateContext {
	language: string;
	chatContext?: string;
}

class EmptyContext implements TemplateContext {
	language: string = '';
	chatContext?: string | undefined;
}
