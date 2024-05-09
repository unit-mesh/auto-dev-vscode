const Parser = require("web-tree-sitter");
import { TfIdf } from "../../code-search/search/tfidf/Tfidf";

import { TfIdfSemanticChunkSearch } from '../../code-search/search/TfIdfSemanticChunkSearch';
import { TermSplitter } from "../../code-search/search/tfidf/TermSplitter";
import { TestLanguageService } from "../TestLanguageService";
import { CollapsedCodeChunker } from "../../code-search/chunk/_base/CollapsedCodeChunker";
import { ChunkWithoutID } from "../../code-search/chunk/_base/Chunk";
import { TSLanguageUtil } from "../../code-context/ast/TreeSitterWrapper";

describe('TfIdfWithSemanticChunkSearch', () => {
    let tfIdfWithSemanticChunkSearch: TfIdfSemanticChunkSearch;

    beforeEach(() => {
        tfIdfWithSemanticChunkSearch = new TfIdfSemanticChunkSearch();
    });

    describe('addDocument', () => {
        it('should add documents to the TfIdf instance', () => {
            const chunks = ['chunk1', 'chunk2', 'chunk3'];
            tfIdfWithSemanticChunkSearch.addDocuments(chunks);
            expect(tfIdfWithSemanticChunkSearch['tfidf']['documents'].length).to.equal(chunks.length);
        });

        it('should chunk for hello, world', () => {
            const javaHelloWorld = `
            import java.util.Scanner;
            
            public class HelloWorld {
                public static void main(String[] args) {
                    System.out.println("Hello, World!");
                }
            }`;

            const chunks = TermSplitter.syncSplitTerms(javaHelloWorld);
            tfIdfWithSemanticChunkSearch.addDocuments(chunks);
            expect(tfIdfWithSemanticChunkSearch['tfidf']['documents'].length).to.equal(chunks.length);
        });
    });

    describe('search', () => {
        it('should return TfIdf values for a given query', () => {
            const chunks = ['chunk1', 'chunk2', 'chunk3'];
            const query = 'chunk1';
            tfIdfWithSemanticChunkSearch.addDocuments(chunks);
            const result = tfIdfWithSemanticChunkSearch.search(query);
            expect(result).to.be.an('array');
            expect(result[0]).to.be.a('number');
        });

        it('should execute the callback function if provided', (done) => {
            const chunks = ['chunk1', 'chunk2', 'chunk3'];
            const query = 'chunk1';
            tfIdfWithSemanticChunkSearch.addDocuments(chunks);
            tfIdfWithSemanticChunkSearch.search(query, (i, measure) => {
                expect(i).to.be.a('number');
                expect(measure).to.be.a('number');
            });
        });
    });

    describe('MultipleChunk', () => {
        let parser: any;

        beforeEach(async () => {
            await Parser.init();
            parser = new Parser();

            const languageService = new TestLanguageService(parser);
            const language = await TSLanguageUtil.for("java")!!.grammar(languageService, "java")!!;
            parser.setLanguage(language);
        });

        it('should success', async () => {
            let nodeCode = `class Node {
    int value;
    List<Node> neighbors;

    public Node(int value) {
        this.value = value;
        this.neighbors = new ArrayList<>();
    }

    public void addNeighbor(Node neighbor) {
        neighbors.add(neighbor);
    }
}`;

            let graphCode = `class Graph {
    List<Node> nodes;

    public Graph() {
        this.nodes = new ArrayList<>();
    }

    // 添加节点
    public void addNode(Node node) {
        nodes.add(node);
    }

    // 添加边
    public void addEdge(Node from, Node to) {
        from.addNeighbor(to);
        to.addNeighbor(from); // 如果是无向图，需要双向连接
    }
}`;

            let sampleCode = `
import java.util.*;

// 节点类
${nodeCode}

// 图类
${graphCode}
`;
            let chunker = new CollapsedCodeChunker();
            let codeChunker: AsyncGenerator<ChunkWithoutID> = chunker.parsedCodeChunker(parser, sampleCode, 100);

            let tfidf = new TfIdf();
            for await (let chunk of codeChunker) {
                tfidf.addDocument(chunk.content);
            }

            let results = tfidf.tfidfs('node');
            expect(results).to.have.length(2);

            console.log(results);

            // first should > 2, second will > 3
            expect(results[0]).to.be.greaterThan(2).and.lessThan(3);
            expect(results[1]).to.be.greaterThan(3).and.lessThan(4);
        });
    });
});
