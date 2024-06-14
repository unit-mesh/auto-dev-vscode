---
layout: default
title: Code Completions
parent: Basic Features
nav_order: 1
---

Automatically completes your code based on the position of your cursor.

## Enable Feature

Not enabled by default, see [AutoDev: Code Completion](../configuration.md#code-completion)。

```jsonc
{
  "autodev.openai.apiKey": "sk-xxxxx", // Your openai api key
  "autodev.completions.enable": true // Enabled Inline Completions
}
```

Now let's try writing some code.

## Select code Model

You can hope that you use specific code models instead of dialog models

```jsonc
{
  "autodev.completions.model": "gpt-4o" // Overriding the default chat model
}
```

Recommended to use a specially trained code model, or a base model that supports fim.

## Connect to local model

Here is an example of ollama, see [OpenAI compatibility](https://github.com/ollama/ollama/blob/main/docs/openai.md) for details.

```jsonc
{
  "autodev.openai.baseURL": "http://127.0.0.1:11434/v1/", // Your local service url
  "autodev.openai.apiKey": "sk-xxxxx", // Your local service api key
  "autodev.completions.model": "codeqwen:7b-code-v1.5-q5_1" // Overriding the default chat model
}
```

If your self-built service is deployed in a mode that does not support chat, you may need to enable [legacy mode](#enable-legacy-mode).

## Enable Legacy Mode

The default is the traditional `/v1/completions` instead of `/v1/chat/completions`, but you can fall back to the old mode.

> Only working on openai provider

```jsonc
{
  "autodev.completions.enableLegacyMode": true
}
```
