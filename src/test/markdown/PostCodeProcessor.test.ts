import { PostCodeProcessor } from "../../markdown/PostCodeProcessor";

describe('PostCodeProcessor', () => {
	describe('execute method', () => {
		it('should correctly format complete code with prefix and suffix code', () => {
			const prefixCode = 'function someFunction() {\n';
			const suffixCode = '\n}';
			const completeCode = 'console.log("Hello, world!");';
			const processor = new PostCodeProcessor(prefixCode, suffixCode, completeCode);
			const formattedCode = processor.execute();

			expect(formattedCode).toBe("    console.log(\"Hello, world!\");");
		});

		it('should correctly format complete code with indentation and braces', () => {
			const prefixCode = 'function someFunction() {\n';
			const suffixCode = '\n}';
			const completeCode = 'if (true) {\nconsole.log("Hello, world!");\n}';
			const processor = new PostCodeProcessor(prefixCode, suffixCode, completeCode);
			const formattedCode = processor.execute();
			expect(formattedCode).toBe(
				"    if (true) {\n" +
				"    console.log(\"Hello, world!\");\n" +
				"    }"
			);
		});

		it('should return empty string if complete code is empty', () => {
			const prefixCode = 'function someFunction() {\n';
			const suffixCode = '\n}';
			const completeCode = '';
			const processor = new PostCodeProcessor(prefixCode, suffixCode, completeCode);
			const formattedCode = processor.execute();

			expect(formattedCode).toBe('');
		});
	});
});
