import { expect } from 'chai';
import { MarkdownTextProcessor } from "../../markdown/MarkdownTextProcessor";

describe('MarkdownTextProcessor', () => {
  describe('buildDocFromSuggestion', () => {
    it('should return empty string if commentStart is not found in suggestDoc', () => {
      const suggestDoc = 'This is a test suggestion';
      const commentStart = '/*';
      const commentEnd = '*/';

      const result = MarkdownTextProcessor.buildDocFromSuggestion(suggestDoc, commentStart, commentEnd);

      expect(result).to.equal('');
    });

    it('should return the full doc comment if commentEnd is not found in suggestDoc', () => {
      const suggestDoc = '/* This is a test suggestion';
      const commentStart = '/*';
      const commentEnd = '*/';

      const result = MarkdownTextProcessor.buildDocFromSuggestion(suggestDoc, commentStart, commentEnd);

      expect(result).to.equal('/* This is a test suggestion*/');
    });

    it('should return the substring between commentStart and commentEnd in suggestDoc', () => {
      const suggestDoc = '/* This is a test suggestion */';
      const commentStart = '/*';
      const commentEnd = '*/';

      const result = MarkdownTextProcessor.buildDocFromSuggestion(suggestDoc, commentStart, commentEnd);

      expect(result).to.equal('/* This is a test suggestion */');
    });

    // should parse comemnt form coode + comment
    it('should return the substring between commentStart and commentEnd in suggestDoc', () => {
      const suggestDoc = `
/**
 * This is a test suggestion
 */
public void test() {
}
`;
      const commentStart = '/**';
      const commentEnd = '*/';

      const result = MarkdownTextProcessor.buildDocFromSuggestion(suggestDoc, commentStart, commentEnd);

      expect(result).to.equal('/**\n * This is a test suggestion\n */');
    });
  });
});
