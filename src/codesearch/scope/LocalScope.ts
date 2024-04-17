import { TextRange } from "../model/TextRange";
import { NodeKind } from "./NodeKind";
import { ScopeGraph, ScopeToScope } from "../ScopeGraph";
import Graph from "graphology";
import { start } from "node:repl";

export class LocalScope extends NodeKind {
	range: TextRange;

	constructor(range: TextRange) {
		super(range);
		this.range = range;
	}
}

export class ScopeStack implements Iterable<string> {
	private scopeGraph: Graph<NodeKind>;
	private start: string | null;

	constructor(scopeGraph: Graph<NodeKind>, start: string | null = null) {
		this.scopeGraph = scopeGraph;
		this.start = start;
	}

	[Symbol.iterator](): Iterator<string> {
		// @ts-ignore
		return undefined;
	}

	// public next(): string | undefined {
	// 	console.log(this.start);
	// 	if (this.start) {
	// 		const parent = this.scopeGraph.directedEdges(
	// 			this.start, ScopeToScope
	// 		);
	//
	// 		if (parent) {
	// 			const original = this.start;
	// 			this.start = parent[0];
	// 			return original;
	// 		}
	//
	// 		return undefined;
	// 	} else {
	// 		return undefined;
	// 	}
	// }
}