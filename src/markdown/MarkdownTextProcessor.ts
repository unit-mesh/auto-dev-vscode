export class MarkdownTextProcessor {
	static buildDocFromSuggestion(suggestDoc: string, commentStart: string, commentEnd: string): string {
		const startIndex = suggestDoc.indexOf(commentStart);
		if (startIndex < 0) {
			return "";
		}

		const docComment = suggestDoc.substring(startIndex);
		const endIndex = docComment.indexOf(commentEnd, commentStart.length);
		if (endIndex < 0) {
			return docComment + commentEnd;
		}

		const substring = docComment.substring(0, endIndex + commentEnd.length);
		return substring;
	}
}