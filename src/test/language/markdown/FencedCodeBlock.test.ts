import { MarkdownCodeBlock } from "../../../markdown/MarkdownCodeBlock";

describe('FencedCodeBlock', () => {
	describe('parse method', () => {
		it('should correctly parse a fenced code block with specified language', () => {
			const content = '```javascript\nconsole.log("Hello, world!");\n```';
			const parsedBlock = MarkdownCodeBlock.parse(content);

			expect(parsedBlock.language).toBe('javascript');
			expect(parsedBlock.text).toBe('console.log("Hello, world!");');
			expect(parsedBlock.isComplete).toBe(true);
		});

		it('should correctly parse a fenced code block without specified language', () => {
			const content = '```\nconsole.log("Hello, world!");\n```';
			const parsedBlock = MarkdownCodeBlock.parse(content);

			expect(parsedBlock.language).toBe('markdown');
			expect(parsedBlock.text).toBe('console.log("Hello, world!");');
			expect(parsedBlock.isComplete).toBe(true);
		});

		it('should correctly parse a fenced code block with empty content', () => {
			const content = '```\n```';
			const parsedBlock = MarkdownCodeBlock.parse(content);

			expect(parsedBlock.language).toBe('markdown');
			expect(parsedBlock.text).toBe('```\n```');
			expect(parsedBlock.isComplete).toBe(true);
		});

		it('should correctly parse a fenced code block with whitespace', () => {
			const content = '```typescript\n\nconsole.log("Hello, world!");\n\n```';
			const parsedBlock = MarkdownCodeBlock.parse(content);

			expect(parsedBlock.language).toBe('typescript');
			expect(parsedBlock.text).toBe('console.log("Hello, world!");');
			expect(parsedBlock.isComplete).toBe(true);
		});
	});

	describe('findLanguage method', () => {
		it('should return correct language name for known languages', () => {
			expect(MarkdownCodeBlock.findLanguage('javascript')).toBe('javascript');
			expect(MarkdownCodeBlock.findLanguage('c#')).toBe('csharp');
			expect(MarkdownCodeBlock.findLanguage('c++')).toBe('cpp');
		});

		it('should return default language for unknown languages', () => {
			expect(MarkdownCodeBlock.findLanguage('unknown')).toBe('markdown');
		});
	});
});
