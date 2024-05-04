import { TextRange } from "../model/TextRange";
import { NodeKind } from "./NodeKind";
import { ScopeToScope } from "../ScopeGraph";
import Graph from "graphology";

export class LocalScope extends NodeKind {
	range: TextRange;

	constructor(range: TextRange) {
		super(range);
		this.range = range;
	}
}

export class ScopeStack implements Iterable<string> {
	private scopeGraph: Graph<NodeKind>;
	private start: string | undefined;

	constructor(scopeGraph: Graph<NodeKind>, start: string | undefined = undefined) {
		this.scopeGraph = scopeGraph;
		this.start = start;
	}

	[Symbol.iterator](): Iterator<string> {
		let current = this.start;

		return {
			next: () => {
				if (current) {
					const parentId = this.scopeGraph.outEdges(current)
						.filter(edge => this.scopeGraph.getEdgeAttributes(edge) instanceof ScopeToScope)
						.map(edge => this.scopeGraph.target(edge))[0];

					const original = current;
					current = parentId;
					return { value: original, done: false };
				} else {
					return { value: undefined, done: true };
				}
			}
		};
	}
}
