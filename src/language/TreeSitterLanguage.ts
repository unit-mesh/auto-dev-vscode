// A generic language wrapper type.

import { TSLanguageConfig } from "../semantic-treesitter/TSLanguageConfig";
import { JAVA_TREESITTER } from "../semantic-treesitter/java.treesitter";

export const ALL_LANGUAGES: TSLanguageConfig[] = [JAVA_TREESITTER];

export class TSLanguage {
  // Find a tree-sitter language configuration from a language identifier
  //
  // See [0] for a list of valid language identifiers.
  //
  // [0]: https://github.com/monkslc/hyperpolyglot/blob/master/src/codegen/languages.rs
  static fromId(langId: string): TSLanguageConfig | undefined {
    const foundLanguage = ALL_LANGUAGES.find((target) => {
      return target.languageIds.some(
        (id) => id.toLowerCase() === langId.toLowerCase()
      );
    });

    return foundLanguage;
  }
}
