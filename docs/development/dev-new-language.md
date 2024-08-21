---
layout: default
title: Dev New Language
nav_order: 3
parent: Development
---

## Add a New Language

If you want to add a new language support, you can follow the steps below:

1. Create a new file in `src/code-context/${your-newlanguage}` folder, for example, `src/code-context/java`.
2. Implement the following interfaces:
    - `LanguageProfile.ts`, core configuration for the language
    - `RelevantCodeProvider.ts`, which will provider the related code for the code
    - `BaseStructurerProvider.ts`, which will provider the UML for simplifying the code
    - `TestGenProvider.ts`, which will provider the test generation for the code
3. Add to `ProviderContainer.config.ts`, for example:
```typescript
providerContainer.bind(IToolchainContextProvider).to(SpringContextProvider);
providerContainer.bind(IToolchainContextProvider).to(JavaVersionProvider);

providerContainer.bind(IRelevantCodeProvider).to(JavaRelevantCodeProvider);
providerContainer.bind(ITestGenProvider).to(JavaTestGenProvider);
providerContainer.bind(IBuildToolProvider).to(GradleBuildToolProvider);
providerContainer.bind(IStructurerProvider).to(JavaStructurerProvider);
```

## LanguageConfig

```typescript
export interface LanguageProfile {
	// A list of language names that can be processed by these node queries
	// e.g.: ["Typescript", "TSX"], ["Rust"]
	languageIds: string[];

	// Extensions that can help classify the file: .rs, .rb, .cabal
	fileExtensions: string[];

	// tree-sitter grammar for this language
	grammar: (langService: ILanguageServiceProvider, langId?: LanguageIdentifier) => Promise<Language | undefined>;

	// Compiled tree-sitter node query for this language.
	scopeQuery: MemoizedQuery;

	// Compiled tree-sitter hoverables query
	hoverableQuery: MemoizedQuery;

	// in java, the canonical name is the package name
	packageQuery?: MemoizedQuery;

	// class query
	classQuery: MemoizedQuery;

	// method query
	methodQuery: MemoizedQuery;

	blockCommentQuery: MemoizedQuery;

	// method input and output query
	methodIOQuery?: MemoizedQuery;

	fieldQuery?: MemoizedQuery;

	// structurer query
	structureQuery: MemoizedQuery;

	// Namespaces defined by this language,
	// E.g.: type namespace, variable namespace, function namespace
	namespaces: NameSpaces;

	// should select parent
	// for example, in JavaScript/TypeScript, if we select function, we should also select the export keyword.
	autoSelectInsideParent: string[];

	/// for IO analysis
	builtInTypes: string[];

	// should return true if the file is a test file
	isTestFile: (filePath: string) => boolean;
}

```
