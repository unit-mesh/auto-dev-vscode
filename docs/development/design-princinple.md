---
layout: default
title: Design Principles
nav_order: 1
parent: Development
---

## Unique Architecture (Todo)

Cross-platform for share code between JetBrains IDE and VSCode.

feature todos:

- [ ] use Kotlin to share code between JetBrains IDE and VSCode.
- [ ] use Rust build for build LSP server to improve performance.

## Event-Driven

Since VSCode is an event-driven system, we need to follow the event-driven architecture to handle the events.

So, we have two main parts:

- VSCode-Editor event handler
- VSCode-Webview event handler

## IoC

We utilize [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) for provider management across
various languages.

For IoC (Inversion of Control) implementation, our current design
leverages [inversify](https://github.com/inversify/InversifyJS).

- ProviderTypes.ts is a list of providers that can be injected into the system.
   - ChatContextProvider,
   - RelatedCodeProvider,
   - BuildToolProvider,
   - TestGenProvider,
   - Structurer,
   - ActionCreator,
- ProviderContainer.config.ts is a container for all providers, which you can inject into the system.

