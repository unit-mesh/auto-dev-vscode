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

	async relatedClassesContext(languageId: SupportedLanguage, file: TreeSitterFile, namedElement: NamedElement, languageService: TSLanguageService = new DefaultLanguageService()) {
		let relatedProvider = RelevantCodeProviderManager.getInstance().provider(languageId, languageService);
		let relatedFiles: CodeFile[] = [];
		if (relatedProvider) {
			relatedFiles = await relatedProvider.getMethodFanInAndFanOut(file, namedElement);
		}

		let umlPresenter = new CommentedUmlPresenter();
		return relatedFiles.map((codeStructure) => {
			return umlPresenter.present(codeStructure);
		}).join("\n");
	}
}
