---
layout: default
title: Code Completions
parent: Basic Features
nav_order: 1
---

Automatically completes your code based on the position of your cursor.

> We validate the codegemma, codeqwen, and codellama，other models need to be tested on their own.

## Enable Code Completions

Not enabled by default, see [AutoDev: Code Completion](../configuration.md#code-completion)。

```jsonc
{
	"autodev.completions.enable": true, // Enabled or disable
}
```

Next step: select a code pre-training variant that specializes in code completion and generation of code prefixes and/or suffixes.

## Fill-in-the-middle

Fill-in-the-middle (FIM) is a special prompt format supported by the code completion model can complete code between two already written code blocks.

[codellama](https://ollama.com/blog/how-to-prompt-code-llama) expects a specific format for infilling code:

```json
{
	"autodev.experimental.fimSpecialTokens": {
		"prefix": "<PRE>",
		"suffix": "<SUF>",
		"middle": "<MID>"
	}
}
```

[codeqwen](https://github.com/QwenLM/CodeQwen1.5/blob/main/examples/CodeQwen1.5-base-fim.py) expects a specific format for infilling code:

```json
{
	"autodev.experimental.fimSpecialTokens": {
		"prefix": "<fim_prefix>",
		"suffix": "<fim_suffix>",
		"middle": "<fim_middle>"
	}
}
```

[codegemma](https://ai.google.dev/gemma/docs/formatting) expects a specific format for infilling code:

```json
{
	"autodev.experimental.fimSpecialTokens": {
		"prefix": "<|fim_prefix|>",
		"suffix": "<|fim_suffix|>",
		"middle": "<|fim_middle|>"
	}
}
```

For other models, please select the appropriate special format.

**TIP:** codeqwen and codegemma can be used with the same.

## Best practice

Because of the lack of resources, we used "ollama" to verify the reliability of the model.

### Use CodeQwen

Support for `codeqwen:7b-code-v1.5-q5_1`.

> The most stable model available.

```jsonc
{
	"autodev.completions.provider": "ollama",
	"autodev.completions.model": "codeqwen:7b-code-v1.5-q5_1",
}
```

### Use CodeLlama

Support for `codellama:7b`, `codellama:7b-code`, `codellama:7b-instruct`

> Unstable generation.

```jsonc
{
	"autodev.completions.provider": "ollama",
	"autodev.completions.model": "codellama:7b-code",
	"autodev.experimental.fimSpecialTokens": {
		"prefix": "<PRE>",
		"suffix": "<SUF>",
		"middle": "<MID>",
	},
}
```

### Use CodeGemma

Support for `codegemma:2b-code`

> Unstable generation.

```jsonc
{
	"autodev.completions.provider": "ollama",
	"autodev.completions.model": "codegemma:2b-code",
}
```
