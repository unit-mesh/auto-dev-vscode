import { TSLanguageConfig } from "./_base/TSLanguageConfig";
import { JavaTSConfig } from "./java/JavaTSConfig";
import { TypeScriptTSConfig } from "./typescript/TypeScriptTSConfig";
import { GoTSConfig } from "./go/GoTSConfig";

export const ALL_LANGUAGES: TSLanguageConfig[] = [
  JavaTSConfig,
  GoTSConfig,
  TypeScriptTSConfig,
];

export class TSLanguageUtil {
  static fromId(langId: string): TSLanguageConfig | undefined {
    return ALL_LANGUAGES.find((target) => {
      return target.languageIds.some(
        (id) => id.toLowerCase() === langId.toLowerCase()
      );
    });
  }
}
