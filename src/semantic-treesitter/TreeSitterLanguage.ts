import { TSLanguageConfig } from "./langconfig/TSLanguageConfig";
import { JavaTSConfig } from "./langconfig/JavaTSConfig";
import { TypeScriptTSConfig } from "./langconfig/TypeScriptTSConfig";
import { GoTSConfig } from "./langconfig/GoTSConfig";

export const ALL_LANGUAGES: TSLanguageConfig[] = [
  JavaTSConfig,
  GoTSConfig,
  TypeScriptTSConfig
];

export class TSLanguage {
  static fromId(langId: string): TSLanguageConfig | undefined {
    return ALL_LANGUAGES.find((target) => {
      return target.languageIds.some(
        (id) => id.toLowerCase() === langId.toLowerCase()
      );
    });
  }
}
