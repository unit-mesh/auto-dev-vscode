import { TreeSitterFileManager } from 'src/editor/cache/TreeSitterFileManager';
import vscode from 'vscode';

import { createNamedElement } from '../../../code-context/ast/TreeSitterWrapper';
import { NamedElement } from '../../../editor/ast/NamedElement';
import { TextRange } from '../../scope-graph/model/TextRange';
import { ChunkItem, Embedding } from './Embedding';

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
	static async create(treeSitterFileManager: TreeSitterFileManager, chunk: ChunkItem): Promise<NamedChunkItem> {
		let document;
		try {
			const fileUri = vscode.Uri.file(chunk.path);
			document = await vscode.workspace.openTextDocument(fileUri);
		} catch (error) {
			return Promise.reject(error);
		}

		let elementBuilder = await createNamedElement(treeSitterFileManager, document);

		let namedElements = elementBuilder.getElementForSelection(chunk.range.start.line, chunk.range.end.line);

		return {
			name: chunk.name,
			path: chunk.path,
			text: chunk.text,
			range: chunk.range,
			namedElements: namedElements,
			embedding: chunk.embedding,
		};
	}
}
