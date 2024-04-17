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
		return {
			next: () => {
				if (this.start) {
					let parentId;
					this.scopeGraph.forEachOutboundEdge(this.start, (edge, target: any) => {
						if (target instanceof ScopeToScope) {
							parentId = edge;
						}
					});

					if (parentId) {
						this.start = parentId;
						return { value: parentId, done: true };
					}

					return { value: undefined, done: true };
				} else {
					return { value: undefined, done: true };
				}
			}
		};
	}
}