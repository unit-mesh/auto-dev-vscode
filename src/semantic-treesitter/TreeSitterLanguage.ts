import { TSLanguageConfig } from "./TSLanguageConfig";
import { JavaTSConfig } from "./java/JavaTSConfig";
import { TypeScriptTSConfig } from "./typescript/TypeScriptTSConfig";
import { GoTSConfig } from "./go/GoTSConfig";

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
