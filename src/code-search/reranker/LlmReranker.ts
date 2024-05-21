import { Chunk } from "../chunk/_base/Chunk";
import { Reranker } from "./Reranker";
import { getBasename } from "../utils/IndexPathHelper";
import { TemplateContext } from "../../prompt-manage/template/TemplateContext";
import { PromptManager } from "../../prompt-manage/PromptManager";
import { ActionType } from "../../prompt-manage/ActionType";

export interface RerankContext extends TemplateContext {
  query: string;
  documentId: string;
  document: string;
}

const RERANK_PROMPT = async (
  query: string,
  documentId: string,
  document: string,
) => {
  const context: RerankContext = {
    query,
    documentId,
    document,
    language: ""
  };

  let instruction = await PromptManager.getInstance().generateInstruction(ActionType.LlmReranker, context);
  return instruction;
};

export class LLMReranker implements Reranker {
  name = "llmReranker";

  constructor(private readonly llm: any) {}

  async scoreChunk(chunk: Chunk, query: string): Promise<number> {
    const completion = await this.llm.complete(
      RERANK_PROMPT(query, getBasename(chunk.filepath), chunk.content),
      {
        maxTokens: 1,
        model:
          this.llm.providerName.startsWith("openai") &&
          this.llm.model.startsWith("gpt-4")
            ? "gpt-3.5-turbo"
            : this.llm.model,
      },
    );

    if (!completion) {
      // TODO: Why is this happening?
      return 0.0;
    }

    let answer = completion
      .trim()
      .toLowerCase()
      .replace(/"/g, "")
      .replace(/'/g, "");

    if (answer === "yes") {
      return 1.0;
    } else if (answer === "no") {
      return 0.0;
    } else {
      console.warn(
        `Unexpected response from single token reranker: "${answer}". Expected "yes" or "no".`,
      );
      return 0.0;
    }
  }

  async rerank(query: string, chunks: Chunk[]): Promise<number[]> {
    const scores = await Promise.all(
      chunks.map((chunk) => this.scoreChunk(chunk, query)),
    );
    return scores;
  }
}
