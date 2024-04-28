// eslint-disable-next-line @typescript-eslint/naming-convention
const Parser = require("web-tree-sitter");

import { ChunkWithoutID } from "../../code-search/chunk/Chunk";
import { parsedCodeChunker } from "../../code-search/chunk/util/CodeChunkerUtil";
import { JavaLangConfig } from "../../code-context/java/JavaLangConfig";
import { TestLanguageService } from "../TestLanguageService";

describe('CodeChunk for Java', () => {
	let parser: any;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();

		const languageService = new TestLanguageService(parser);
		const language = await JavaLangConfig.grammar(languageService, "java")!!;
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
		let codeChunker: AsyncGenerator<ChunkWithoutID> = parsedCodeChunker(parser, sampleCode, 100);
		const results = [];

		for await (let chunk of codeChunker) {
			results.push(chunk);
		}

		expect(results.length).toBe(2);

		expect(results[0].content).toBe(nodeCode);
		expect(results[1].content).toBe(graphCode);
	});
});
