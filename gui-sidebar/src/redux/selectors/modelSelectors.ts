import { DEFAULT_MAX_TOKENS } from "../../shims/llm-constants";
import { RootState } from "../store";
import { ModelDescription } from "../../shims/typings";

export const defaultModelSelector = (state: RootState) => {
  const title = state.state.defaultModelTitle ?? "";
  return state.state.config.models.find((model: ModelDescription) => model.title === title)
};

export const contextLengthSelector = (state: RootState) => {
  return defaultModelSelector(state)?.contextLength || DEFAULT_MAX_TOKENS;
};
