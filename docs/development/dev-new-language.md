---
layout: default
title: Dev New Language
nav_order: 1
parent: Development
---

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
