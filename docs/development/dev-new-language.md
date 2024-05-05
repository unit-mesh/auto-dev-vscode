---
layout: default
title: Dev New Language
nav_order: 2
parent: Development
---

## Add a New Language

If you want to add a new language support, you can follow the steps below:

1. Create a new file in `src/semantic/${your-newlanguage}` folder, for example, `src/semantic/java`.
2. Implement the following interfaces:
    - `LanguageConfig.ts`, core configuration for the language
    - `RelatedCodeProvider.ts`, which will provider the related code for the code
    - `Structurer.ts`, which will provider the UML for simplifying the code
    - `TestGenProvider.ts`, which will provider the test generation for the code
3. Add to ProviderManager, for example:
    - RelatedCodeProviderManager
    - StructurerProviderManager
    - TestGenProviderManager

## LanguageConfig

```typescript
export interface LanguageConfig {
	// A list of language names that can be processed by these node queries
	// e.g.: ["typescript", "typescriptreact"], ["rust"]
	languageIds: string[];

	// Extensions that can help classify the file: .rs, .rb, .cabal
	fileExtensions: string[];

	// tree-sitter grammar for this language
	grammar: (langService: TSLanguageService, langId: SupportedLanguage) => Promise<Language | undefined>;

	// Compiled tree-sitter node query for this language.
	scopeQuery: MemoizedQuery;

	// Compiled tree-sitter hoverables query
	hoverableQuery: MemoizedQuery;

	// class query
	classQuery: MemoizedQuery;

	// method query
	methodQuery: MemoizedQuery;

	// method input and output query
	methodIOQuery?: MemoizedQuery;

	// structurer query
	structureQuery: MemoizedQuery;

	// Namespaces defined by this language,
	// E.g.: type namespace, variable namespace, function namespace
	namespaces: NameSpaces;
}
```
