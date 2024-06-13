import { LanguageIdentifier } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { NamedElement } from '../editor/ast/NamedElement';
import { CodeFile } from '../editor/codemodel/CodeElement';
import { CommentedUmlPresenter } from '../editor/codemodel/presenter/CommentedUmlPresenter';
import { providerContainer } from '../ProviderContainer.config';
import { IRelevantCodeProvider } from '../ProviderTypes';
import { RelevantCodeProvider } from './_base/RelevantCodeProvider';
import { TreeSitterFile } from './ast/TreeSitterFile';

export class RelevantCodeProviderManager {
	private relatedMap: Map<LanguageIdentifier, RelevantCodeProvider> = new Map();

	/**
	 * @param lsp - An instance of `LanguageServiceProvider` which is used to provide language-specific services. If not provided, a new instance of `DefaultLanguageServiceProvider` is used.
	 */
	constructor(private lsp: ILanguageServiceProvider) {
		this.relatedMap = new Map();
		providerContainer.getAll(IRelevantCodeProvider).forEach(provider => {
			this.relatedMap.set(provider.language, provider);
		});
	}

	provider(lang: LanguageIdentifier, langService: ILanguageServiceProvider): RelevantCodeProvider | undefined {
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
	 *
	 * The method first gets the relevant code provider for the given language ID and language service. If a relevant provider is found, it retrieves the related files using the `getMethodFanInAndFanOut` method of the provider.
	 *
	 * The method then renders the related files and returns the result.
	 *
	 * @returns A promise that resolves with the rendered related files.
	 *
	 * @throws Will throw an error if the relevant code provider is not found.
	 */
	async relatedClassesContext(languageId: LanguageIdentifier, file: TreeSitterFile, namedElement: NamedElement) {
		let relatedProvider = this.provider(languageId, this.lsp);
		if (!relatedProvider) {
			return Promise.resolve('');
		}

		let relatedFiles: CodeFile[] = [];
		relatedFiles = await relatedProvider.getMethodFanInAndFanOut(file, namedElement);

		return this.renderFiles(relatedFiles);
	}

	renderFiles(relatedFiles: CodeFile[]) {
		let umlPresenter = new CommentedUmlPresenter();
		return relatedFiles
			.map(codeStructure => {
				return umlPresenter.present(codeStructure);
			})
			.join('\n');
	}
}
