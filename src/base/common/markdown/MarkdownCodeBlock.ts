export class MarkdownCodeBlock {
	language: string;
	startLine: number;
	endLine: number;
	code: string;

	constructor(language: string, startLine: number, endLine: number, code: string) {
		this.language = language;
		this.startLine = startLine;
		this.endLine = endLine;
		this.code = code;
	}

	static from(markdown: string): MarkdownCodeBlock[] {
		const regex = /```(\w+)?\s([\s\S]*?)```/gm;
		const blocks: MarkdownCodeBlock[] = [];
		let match;

		while ((match = regex.exec(markdown)) !== null) {
			const startLine = markdown.substring(0, match.index).split('\n').length;
			const endLine = startLine + match[0].split('\n').length - 1;
			blocks.push(new MarkdownCodeBlock(match[1] || 'plaintext', startLine, endLine, match[2]));
		}

		return blocks;
	}
}
