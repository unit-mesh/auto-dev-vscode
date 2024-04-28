import { MarkdownChunker } from '../../code-search/chunk/MarkdownChunker';

describe('MarkdownChunker', () => {
  let markdownChunker: MarkdownChunker;

  beforeEach(() => {
    markdownChunker = new MarkdownChunker();
  });

  describe('markdownChunker', () => {
    it('should return a chunk of the content', async () => {
      const content = '# Header\nThis is some content.';
      const chunks = markdownChunker.markdownChunker(content, 10, 1);
      const result = [];
      for await (const chunk of chunks) {
        result.push(chunk);
      }
      expect(result).to.have.length(1);
      expect(result[0].content).to.equal(content);
      expect(result[0].startLine).to.equal(0);
      expect(result[0].endLine).to.equal(2);
    });
  });

  describe('findHeader', () => {
    it('should return the header of the content', () => {
      const lines = ['# Header', 'This is some content.'];
      const header = markdownChunker.findHeader(lines);
      expect(header).to.equal('Header');
    });

    it('should return undefined if no header is found', () => {
      const lines = ['This is some content.'];
      const header = markdownChunker.findHeader(lines);
      expect(header).to.be.undefined;
    });
  });
});
