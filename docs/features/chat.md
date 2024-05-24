---
layout: default
title: Normal Chat
parent: Basic Features
nav_order: 3
---

1. Click AutoDev on the left toolbar to open AutoDev.

## Chat Providers

Chat providers can reduce chat mode descriptions.

We support the following providers:

- **provider**: `anthropic`
  - see [AutoDev: Anthropic](../configuration.md#anthropic)
- **provider**: `qianfan`
  - see [AutoDev: Baidu Cloud WenXin](../configuration.md#baidu-cloud-wenxin)
- **provider**: `openai`
  - see [AutoDev: OpenAI](../configuration.md#openai)
- **provider**: `tongyi`
  - see [AutoDev: Ali Cloud TongY](../configuration.md#ali-cloud-tongyi)

For example, use openai:

```jsonc
{
  "autodev.openai.apiKey": "sk-xxxxx", // Your openai api key
  "autodev.chat.models": [
    {
      "provider": "openai", // chat provider
      "title": "GPT-3.5 turbo", // Text displayed in selector
      "model": "gpt-3.5-turbo" // Used chat model
    }
  ]
}
```

see [AutoDev: Chat Models](../configuration.md#chat-models) for more information。

## Using Custom Service

Currently only supports OpenAI Provider and custom support.

> Your service needs to be compatible with OpenAI `/v1/chat/completions` request.

```jsonc
{
  "autodev.chat.models": [
    {
      "provider": "openai", // chat provider
      "title": "LLama 3",
      "apiKey": "ollama", // Prevent SDK errors.
      "baseURL": "http://127.0.0.1:11434/v1/", // service url
      "model": "llama3" // Used chat model
    }
  ]
}
```

Some services have models that may not support multi-model messages, in which case you need to [Enable compatibility mode](#enable-compatibility-mode)

## Enable compatibility mode

Sends requests in a multi-modal message format by default，Your service may not be supported.

```json
{
  "messages": [
    {
      "role": "user",
      // Use arrays instead of string
      "content": [{ "type": "text", "text": "hello" }]
    }
  ]
}
```

But you can turn it off.

```jsonc
{
  "autodev.chat.models": [
    {
      "provider": "openai",
      "title": "LLama 3",
      "apiKey": "ollama",
      "baseURL": "http://127.0.0.1:11434/v1/",
      "model": "llama3",
      "multimodel": false // Turn off message formatting for multiple models
    }
  ]
}
```

The format of the message sent is now:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "hello"
    }
  ]
}
```
