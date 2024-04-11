import * as vscode from 'vscode';
import * as assert from 'assert';
import { after } from 'mocha';

suite('Extension Test Suite', () => {
	after(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
