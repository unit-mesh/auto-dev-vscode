import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { EmbeddingsProvider } from '../../code-search/embedding/_base/EmbeddingsProvider';
import { Reranker } from '../../code-search/reranker/Reranker';
import { TextRange } from '../../code-search/scope-graph/model/TextRange';
import { IdeAction } from '../../editor/editor-api/IdeAction';

export interface ContextSubmenuItem {
	id: string;
	title: string;
	description: string;
}

export interface ContextItem {
	content: string;
	name: string;
	path: string;
	range: TextRange;
	description: string;
	editing?: boolean;
	editable?: boolean;
}

export type ContextProviderType = 'normal' | 'query' | 'submenu';

export interface ContextProviderDescription {
	title: string;
	displayTitle: string;
	description: string;
	renderInlineAs?: string;
	type: ContextProviderType;
}

export type FetchFunction = (url: string | URL, init?: any) => Promise<any>;

export interface LoadSubmenuItemsArgs {
	ide: IdeAction;
	fetch: FetchFunction;
}

export interface RangeInFile {
	filepath: string;
	range: Range;
}

export interface ContextProviderExtras {
	fullInput: string;
	embeddingsProvider: EmbeddingsProvider;
	reranker: Reranker | undefined;
	// todo: replace to other models
	llm: LanguageModelsService;
	ide: IdeAction;
	selectedCode: RangeInFile[];
	fetch: FetchFunction;
}

export interface IContextProvider {
	get description(): ContextProviderDescription;

	getContextItems(query: string, extras: ContextProviderExtras): Promise<ContextItem[]>;

	loadSubmenuItems(args: LoadSubmenuItemsArgs): Promise<ContextSubmenuItem[]>;
}

export abstract class BaseContextProvider implements IContextProvider {
	options: { [key: string]: any };

	constructor(options: { [key: string]: any }) {
		this.options = options;
	}

	static description: ContextProviderDescription;

	get description(): ContextProviderDescription {
		return (this.constructor as any).description;
	}

	// Maybe just include the chat message in here. Should never have to go back to the context provider once you have the information.
	abstract getContextItems(query: string, extras: ContextProviderExtras): Promise<ContextItem[]>;

	async loadSubmenuItems(args: LoadSubmenuItemsArgs): Promise<ContextSubmenuItem[]> {
		return [];
	}
}
