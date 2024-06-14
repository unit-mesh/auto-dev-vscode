import Parser from 'web-tree-sitter';

const WASM_FILE_PATH_TEMPLATE = 'dist/tree-sitter-wasms/tree-sitter-{language}.wasm';

function formatWasmFileName(template: string, languageId: string) {
	return template.replace('{language}', languageId);
}

export type TreeSitterLoaderOptions = {
	pathTemplate?: string;
	pathFactory?: (languageId: string) => string;
	readFile(path: string): Promise<Uint8Array>;
};

export class TreeSitterLoader {
	private _initPromise?: Promise<void>;

	// TODO use lru cache?
	private _parsersCache = new Map<string, Promise<Parser>>();

	constructor(private options: TreeSitterLoaderOptions) {}

	ready() {
		if (this._initPromise) {
			return this._initPromise;
		}

		this._initPromise = Parser.init();

		this._initPromise.catch(error => {
			// For error retries
			this._initPromise = undefined;
		});

		return this._initPromise;
	}

	async parse(languageId: string, input: string): Promise<Parser.Tree> {
		const parser = await this.getLanguageParser(languageId);

		const result = parser.parse(input);

		parser.delete();

		return result;
	}

	async getLanguageParser(languageId: string): Promise<Parser> {
		return this.createLanguageParser(languageId);
	}

	async getLanguage(languageId: string): Promise<Parser.Language> {
		const parser = await this.getLanguageParser(languageId);
		return parser?.getLanguage();
	}

	protected async createLanguageParser(languageId: string) {
		const cache = this._parsersCache;

		if (cache.has(languageId)) {
			return cache.get(languageId)!;
		}

		const parserPromise = this.ready().then(() => {
			return this.initLanguageParser(languageId);
		});

		cache.set(languageId, parserPromise);

		parserPromise.catch(() => {
			cache.delete(languageId);
		});

		return parserPromise;
	}

	protected async initLanguageParser(languageId: string) {
		const language = await this.loadLanguage(languageId);

		const parser = new Parser();

		parser.setLanguage(language);

		return parser;
	}

	protected loadLanguage(languageId: string) {
		return this.loadLanguageWasmFile(languageId).then(bits => Parser.Language.load(bits));
	}

	protected loadLanguageWasmFile(languageId: string) {
		const { pathTemplate, pathFactory, readFile } = this.options;

		if (typeof pathFactory === 'function') {
			return readFile(pathFactory(languageId));
		}

		return readFile(formatWasmFileName(pathTemplate || WASM_FILE_PATH_TEMPLATE, languageId));
	}

	dispose() {
		for (const promise of this._parsersCache.values()) {
			promise.then(c => c.delete());
		}

		this._parsersCache.clear();
	}
}
