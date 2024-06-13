import 'reflect-metadata';

import { TypeScriptStructurer } from '../../../code-context/typescript/TypeScriptStructurer';
import { TestLanguageServiceProvider } from '../../../test/TestLanguageService';

const Parser = require('web-tree-sitter');

describe('JavaStructure', () => {
	it('should convert a simple file to CodeFile', async () => {
		const typeScriptClass = `
interface LabeledValue {
  label: string;
}
`;

		await Parser.init();
		let languageService = new TestLanguageServiceProvider(new Parser());

		const structurer = new TypeScriptStructurer();
		await structurer.init(languageService);

		const codeFile = await structurer.parseFile(typeScriptClass, '');
		expect(codeFile).toEqual({
			name: '',
			filepath: '',
			language: 'typescript',
			functions: [],
			path: '',
			package: '',
			imports: [],
			classes: [
				{
					type: 'interface',
					canonicalName: '',
					constant: [],
					extends: [],
					methods: [],
					name: 'LabeledValue',
					package: '',
					implements: [],
					start: { row: 1, column: 0 },
					end: { row: 3, column: 1 },
					fields: [
						{
							name: 'label',
							start: { row: 2, column: 2 },
							end: { row: 2, column: 7 },
							type: ': string',
						},
					],
				},
			],
		});
	});
});
