import { PostCompletedCodeProcessor } from 'base/common/markdown/PostCompletedCodeProcessor';

describe('PostCodeProcessor', () => {
	describe('execute method', () => {
		it('should correctly format complete code with prefix and suffix code', () => {
			const prefixProblems = 'function someFunction() {\n';
			const suffixProblems = '\n}';
			const completeCode = 'console.log("Hello, world!");';
			const processor = new PostCompletedCodeProcessor(prefixProblems, suffixProblems, completeCode);
			const formattedCode = processor.execute();

			expect(formattedCode).toBe('    console.log("Hello, world!");');
		});

		it('should correctly format complete code with indentation and braces', () => {
			const prefixProblems = 'function someFunction() {\n';
			const suffixProblems = '\n}';
			const completeCode = 'if (true) {\nconsole.log("Hello, world!");\n}';
			const processor = new PostCompletedCodeProcessor(prefixProblems, suffixProblems, completeCode);
			const formattedCode = processor.execute();
			expect(formattedCode).toBe('    if (true) {\n' + '    console.log("Hello, world!");\n' + '    }');
		});

		it('should return empty string if complete code is empty', () => {
			const prefixProblems = 'function someFunction() {\n';
			const suffixProblems = '\n}';
			const completeCode = '';
			const processor = new PostCompletedCodeProcessor(prefixProblems, suffixProblems, completeCode);
			const formattedCode = processor.execute();

			expect(formattedCode).toBe('');
		});
	});
});
