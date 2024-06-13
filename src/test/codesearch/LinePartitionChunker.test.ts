import { ChunkWithoutID } from '../../code-search/chunk/_base/Chunk';
import { LinePartitionChunker } from '../../code-search/chunk/LinePartitionChunker';

describe('LinePartitionChunker', () => {
	let chunker: LinePartitionChunker;

	beforeEach(() => {
		chunker = new LinePartitionChunker();
	});

	describe('chunk', () => {
		it('should return 2 chunks when return 3 lines', async () => {
			const filepath = 'test.txt';
			const contents = 'This is a test content for the LinePartitionChunker class.\nLine 2\nLine3';
			const maxChunkSize = 2;

			const chunks: ChunkWithoutID[] = [];
			let chunkWithoutIDS = chunker.chunk(filepath, contents, maxChunkSize);
			for await (const chunk of chunkWithoutIDS) {
				chunks.push(chunk);
			}

			expect(chunks.length).equal(2);
		});
	});
});
