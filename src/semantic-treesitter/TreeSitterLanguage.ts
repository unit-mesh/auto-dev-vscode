// A generic language wrapper type.

import { TSLanguageConfig } from "./TSLanguageConfig";
import { JavaConfig } from "./java/JavaConfig";

export const ALL_LANGUAGES: TSLanguageConfig[] = [JavaConfig];

export class TSLanguage {
  // Find a tree-sitter language configuration from a language identifier
  //
  // See [0] for a list of valid language identifiers.
  //
  // [0]: https://github.com/monkslc/hyperpolyglot/blob/master/src/codegen/languages.rs
  static fromId(langId: string): TSLanguageConfig | undefined {
    return ALL_LANGUAGES.find((target) => {
      return target.languageIds.some(
        (id) => id.toLowerCase() === langId.toLowerCase()
      );
    });
  }
}
