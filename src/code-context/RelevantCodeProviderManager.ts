import { SupportedLanguage } from "../editor/language/SupportedLanguage";
import { RelevantCodeProvider } from "./_base/RelevantCodeProvider";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";
import { TSLanguageService } from "../editor/language/service/TSLanguageService";
import { TreeSitterFile } from "./ast/TreeSitterFile";
import { DefaultLanguageService } from "../editor/language/service/DefaultLanguageService";
import { CodeFile } from "../editor/codemodel/CodeElement";
import { CommentedUmlPresenter } from "../editor/codemodel/presenter/CommentedUmlPresenter";
import { NamedElement } from "../editor/ast/NamedElement";

export class RelevantCodeProviderManager {
	private static instance: RelevantCodeProviderManager;

	static getInstance(): RelevantCodeProviderManager {
		if (!RelevantCodeProviderManager.instance) {
			RelevantCodeProviderManager.instance = new RelevantCodeProviderManager();
		}
		return RelevantCodeProviderManager.instance;
	}

	private relatedMap: Map<SupportedLanguage, RelevantCodeProvider> = new Map();

	constructor() {
		this.relatedMap = new Map();
		providerContainer.getAll<RelevantCodeProvider>(PROVIDER_TYPES.RelevantCodeProvider).forEach((provider) => {
			this.relatedMap.set(provider.language, provider);
		});
	}

	provider(lang: SupportedLanguage, langService: TSLanguageService): RelevantCodeProvider | undefined {
		let relatedProvider = this.relatedMap.get(lang);
		if (relatedProvider) {
			relatedProvider.setupLanguage(langService);
		}

		return relatedProvider;
	}

	/**
	 * `relatedClassesContext` is an asynchronous method that retrieves the context of related classes for a given named element in a file.
	 *
	 * @param languageId - The ID of the supported language. This is used to get the relevant code provider.
	 * @param file - An instance of `TreeSitterFile` which represents the file where the named element is located.
	 * @param namedElement - An instance of `NamedElement` which represents the element for which related classes are to be found.
	 * @param languageService - An instance of `TSLanguageService` which is used to provide language-specific services. If not provided, a new instance of `DefaultLanguageService` is used.
	 *
	 * The method first gets the relevant code provider for the given language ID and language service. If a relevant provider is found, it retrieves the related files using the `getMethodFanInAndFanOut` method of the provider.
	 *
	 * The method then renders the related files and returns the result.
	 *
	 * @returns A promise that resolves with the rendered related files.
	 *
	 * @throws Will throw an error if the relevant code provider is not found.
	 */
	async relatedClassesContext(languageId: SupportedLanguage, file: TreeSitterFile, namedElement: NamedElement, languageService: TSLanguageService = new DefaultLanguageService()) {
		let relatedProvider = RelevantCodeProviderManager.getInstance().provider(languageId, languageService);
		if (!relatedProvider) {
			return Promise.resolve('');
		}

		let relatedFiles: CodeFile[] = [];
		relatedFiles = await relatedProvider.getMethodFanInAndFanOut(file, namedElement);

		return this.renderFiles(relatedFiles);
	}

	renderFiles(relatedFiles: CodeFile[]) {
		let umlPresenter = new CommentedUmlPresenter();
		return relatedFiles.map((codeStructure) => {
			return umlPresenter.present(codeStructure);
		}).join("\n");
	}
}
