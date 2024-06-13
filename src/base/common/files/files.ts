import { type TextDocument } from 'vscode';

export function isFileTooLarge(doc: TextDocument) {
	if (doc.lineCount > 6000) {
		return true;
	}

	return isLargerThan500kb(doc.getText());
}

export function isLargerThan500kb(content: string) {
	return content.length > 500000;
}
