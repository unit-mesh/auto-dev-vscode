import vscode from "vscode";

import { TextRange } from "../../scope-graph/model/TextRange";
import { NamedElement } from "../../../editor/ast/NamedElement";
import { ChunkItem, Embedding } from "./Embedding";
import { createNamedElement } from "../../../code-context/ast/TreeSitterWrapper";

export interface NamedChunkItem {
	name: string;
	path: string;
	text: string;
	score?: number;
	range: TextRange;
	namedElements: NamedElement[];
	embedding: Embedding;
}

export class NamedChunk {
	static async create(chunk: ChunkItem): Promise<NamedChunkItem> {
		let document;
		try {
			const fileUri = vscode.Uri.file(chunk.path);
			document = await vscode.workspace.openTextDocument(fileUri);
		} catch (error) {
			return Promise.reject(error);
		}

		let elementBuilder = await createNamedElement(document);

		let namedElements = elementBuilder.getElementForSelection(chunk.range.start.line, chunk.range.end.line,);

		return {
			name: chunk.name,
			path: chunk.path,
			text: chunk.text,
			range: chunk.range,
			namedElements: namedElements,
			embedding: chunk.embedding
		};
	}
}