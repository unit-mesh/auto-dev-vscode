---
layout: default
title: Hyde Keywords Strategy
nav_order: 2
parent: Semantic
---

Code file: HydeKeywordsStrategy.ts

1. generate keywords from the user query
2. retrieve code snippets by query from the codebase
3. summarize the code snippets and return the result

```typescript
this.step = HydeStep.Propose;
let documents = await this.generateDocument();
let keywords = documents.content;

this.step = HydeStep.Retrieve;
let queryTerm = this.createQueryTerm(keywords);
let chunkItems = await this.retrieveChunks(queryTerm);

this.step = HydeStep.Evaluate;
let evaluateContext: KeywordEvaluateContext = {
	step: this.step,
	question: keywords.question,
	code: chunkItems.map(item => item.text).join("\n"),
	language: ""
};

if (chunkItems.length === 0) {
	channel.appendLine("No code snippets found.");
	return new StrategyOutput("", []);
}

channel.appendLine("\n");
channel.appendLine(" --- Summary --- ");
let evaluateIns = await PromptManager.getInstance().renderHydeTemplate(this.step, this.documentType, evaluateContext);
return new StrategyOutput(await executeIns(evaluateIns), chunkItems);
```
