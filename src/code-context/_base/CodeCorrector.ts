import vscode from 'vscode';

export interface CorrectorContext {
	document: vscode.TextDocument;
	sourcecode: string;
	packageName: string;
	targetClassName: string;
}

export interface CodeCorrector {
	/**
	 * Corrects the generate AI code.
	 * @param code The code to correct.
	 * @returns The corrected code.
	 */
	correct(code: string): Promise<void>;
}
