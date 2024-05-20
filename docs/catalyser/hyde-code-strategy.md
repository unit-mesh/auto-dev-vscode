---
layout: default
title: Hyde Code Strategy
nav_order: 3
parent: Catalyser
---

Code file: HydeCodeStrategy.ts

1. generate hyde doc code from the user query
2. retrieve code snippets by hyde code from the codebase
3. summarize the code snippets and return the result

```typescript
		channel.appendLine("=".repeat(80));
channel.appendLine(`= Hyde Keywords Strategy: ${this.constructor.name} =`);
channel.appendLine("=".repeat(80));

this.step = HydeStep.Propose;
let documents = await this.generateDocument();
let hydeCode = documents.content;

this.step = HydeStep.Retrieve;
let chunks = await this.retrieveChunks(hydeCode);

this.step = HydeStep.Evaluate;
let evaluateContext: KeywordEvaluateContext = {
	step: this.step,
	question: this.query,
	code: chunks.map(item => item.text).join("\n"),
	language: ""
};

if (chunks.length === 0) {
	channel.appendLine("No code snippets found.");
	return new StrategyOutput("", []);
}

channel.appendLine("\n");
channel.appendLine(" --- Summary --- ");
let evaluateIns = await PromptManager.getInstance().renderHydeTemplate(this.step, this.documentType, evaluateContext);
return new StrategyOutput(await executeIns(evaluateIns), chunks);
```
