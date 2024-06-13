import { MarkdownCodeBlock } from 'base/common/markdown/MarkdownCodeBlock';
import { StreamingMarkdownCodeBlock } from 'base/common/markdown/StreamingMarkdownCodeBlock';

describe('StreamingMarkdownCodeBlock', () => {
	describe('parse method', () => {
		it('should correctly parse a fenced code block with specified language', () => {
			const content = '```javascript\nconsole.log("Hello, world!");\n```';
			const parsedBlock = StreamingMarkdownCodeBlock.parse(content);

			expect(parsedBlock.language).toBe('javascript');
			expect(parsedBlock.text).toBe('console.log("Hello, world!");');
			expect(parsedBlock.isComplete).toBe(true);
		});

		it('should correctly parse a fenced code block without specified language', () => {
			const content = '```\nconsole.log("Hello, world!");\n```';
			const parsedBlock = StreamingMarkdownCodeBlock.parse(content);

			expect(parsedBlock.language).toBe('markdown');
			expect(parsedBlock.text).toBe('console.log("Hello, world!");');
			expect(parsedBlock.isComplete).toBe(true);
		});

		it('should correctly parse multiple fenced code blocks', () => {
			const content = '```javascript\nconsole.log("Hello, JS!");\n```\n```typescript\nconsole.log("Hello, TS!");\n```';
			const parsedBlock = StreamingMarkdownCodeBlock.parse(content);

			expect(parsedBlock.language).toBe('typescript');
			expect(parsedBlock.text).toBe('console.log("Hello, TS!");');
			expect(parsedBlock.isComplete).toBe(true);
		});

		// multiple markdown code blocks
		it('should correctly parse multiple unfinished fenced code blocks', () => {
			const content = '```javascript\nconsole.log("Hello, JS!");\n```\n```typescript\nconsole.log("Hello, TS!");\n';
			const parsedBlock = StreamingMarkdownCodeBlock.multiLineCodeBlock(content);

			expect(parsedBlock.language).toBe('typescript');
			expect(parsedBlock.text).toBe('console.log("Hello, TS!");');
			expect(parsedBlock.isComplete).toBe(false);
		});

		it('should correctly parse filter last fenced code blocks', () => {
			const content = '```javascript\nconsole.log("Hello, JS!");\n```\n```typescript\nconsole.log("Hello, TS!");\n';
			const parsedBlock = StreamingMarkdownCodeBlock.multiLineCodeBlock(content, 'javascript');

			expect(parsedBlock.language).toBe('javascript');
			expect(parsedBlock.text).toBe('console.log("Hello, JS!");');
			expect(parsedBlock.isComplete).toBe(false);
		});

		it('should correctly parse a fenced code block with empty content', () => {
			const content = '```\n```';
			const parsedBlock = StreamingMarkdownCodeBlock.parse(content);

			expect(parsedBlock.language).toBe('markdown');
			expect(parsedBlock.text).toBe('```\n```');
			expect(parsedBlock.isComplete).toBe(true);
		});

		it('should correctly parse a fenced code block with whitespace', () => {
			const content = '```typescript\n\nconsole.log("Hello, world!");\n\n```';
			const parsedBlock = StreamingMarkdownCodeBlock.parse(content);

			expect(parsedBlock.language).toBe('typescript');
			expect(parsedBlock.text).toBe('console.log("Hello, world!");');
			expect(parsedBlock.isComplete).toBe(true);
		});
	});

	describe('findLanguage method', () => {
		it('should return correct language name for known languages', () => {
			expect(StreamingMarkdownCodeBlock.findLanguage('javascript')).toBe('javascript');
			expect(StreamingMarkdownCodeBlock.findLanguage('c#')).toBe('csharp');
			expect(StreamingMarkdownCodeBlock.findLanguage('c++')).toBe('cpp');
		});

		it('should return default language for unknown languages', () => {
			expect(StreamingMarkdownCodeBlock.findLanguage('unknown')).toBe('markdown');
		});
	});
});
