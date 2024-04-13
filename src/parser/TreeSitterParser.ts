import * as vscode from "vscode";

import { type SupportedLanguage } from "../language/SupportedLanguage";
import Parser, { Language } from "web-tree-sitter";
import path from "path";

import { getExtensionUri } from '../context';
import { EXT_LANGUAGE_MAP } from "../language/ExtLanguageMap";

const LanguageParserMap: Map<SupportedLanguage, Parser.Language> = new Map();
async function loadLanguageOndemand(
  langid: SupportedLanguage,
  uri: vscode.Uri | undefined = getExtensionUri(),
) {
  if (!uri) {return;}

  switch (langid) {
    case "c":
      if (!LanguageParserMap.has("c")) {
        LanguageParserMap.set(
          "c",
          await Parser.Language.load(await wasmByLanguage(uri, "c"))
        );
      }
      break;
    case "cpp":
      if (!LanguageParserMap.has("cpp")) {
        LanguageParserMap.set(
          "cpp",
          await Parser.Language.load(await wasmByLanguage(uri, "cpp"))
        );
      }
      break;
    case "csharp":
      if (!LanguageParserMap.has("csharp")) {
        LanguageParserMap.set(
          "csharp",
          await Parser.Language.load(await wasmByLanguage(uri, "c_sharp"))
        );
      }
      break;
    case "go":
      if (!LanguageParserMap.has("go")) {
        LanguageParserMap.set(
          "go",
          await Parser.Language.load(await wasmByLanguage(uri, "go"))
        );
      }
      break;
    case "java":
      if (!LanguageParserMap.has("java")) {
        LanguageParserMap.set(
          "java",
          await Parser.Language.load(await wasmByLanguage(uri, "java"))
        );
      }
      break;
    case "javascript":
      if (!LanguageParserMap.has("javascript")) {
        LanguageParserMap.set(
          "javascript",
          await Parser.Language.load(await wasmByLanguage(uri, "javascript"))
        );
      }
      break;
    case "typescript":
      if (!LanguageParserMap.has("typescript")) {
        LanguageParserMap.set(
          "typescript",
          await Parser.Language.load(await wasmByLanguage(uri, "typescript"))
        );
      }
      break;
    case "typescriptreact":
      if (!LanguageParserMap.has("typescriptreact")) {
        LanguageParserMap.set(
          "typescriptreact",
          await Parser.Language.load(await wasmByLanguage(uri, "tsx"))
        );
      }
      break;
    case "python":
      if (!LanguageParserMap.has("python")) {
        LanguageParserMap.set(
          "python",
          await Parser.Language.load(await wasmByLanguage(uri, "python"))
        );
      }
      break;
    case "rust":
      if (!LanguageParserMap.has("rust")) {
        LanguageParserMap.set(
          "rust",
          await Parser.Language.load(await wasmByLanguage(uri, "rust"))
        );
      }
      break;
    default:
      throw new Error("Unsupported language");
  }
}

export const ParserMap: Record<
  SupportedLanguage,
  (source: string) => Promise<Parser.Tree>
> = {
  c: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageParserMap.get("c"));
    return parser.parse(source);
  },
  cpp: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageParserMap.get("cpp"));
    return parser.parse(source);
  },
  csharp: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageParserMap.get("csharp"));
    return parser.parse(source);
  },
  go: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageParserMap.get("go"));
    return parser.parse(source);
  },
  java: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageParserMap.get("java"));
    return parser.parse(source);
  },
  javascript: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageParserMap.get("javascript"));
    return parser.parse(source);
  },
  typescript: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageParserMap.get("typescript"));
    return parser.parse(source);
  },
  python: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageParserMap.get("python"));
    return parser.parse(source);
  },
  rust: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageParserMap.get("rust"));
    return parser.parse(source);
  },
};

let isInit = false;
export async function parse(
  uri: vscode.Uri,
  langid: SupportedLanguage,
  source: string,
): Promise<Parser.Tree> {
  if (!isInit) {
    await Parser.init();
    isInit = true;
  }

  if (!ParserMap[langid]) {
    throw new Error(`Unsupported language: ${langid}`);
  }

  await loadLanguageOndemand(langid, uri);
  return ParserMap[langid](source);
}

async function wasmByLanguage(extensionUri: vscode.Uri, langId: string) {
  const bits = await vscode.workspace.fs.readFile(
    vscode.Uri.joinPath(
      extensionUri,
      "dist",
      "tree-sitter-wasms",
      `tree-sitter-${langId}.wasm`
    )
  );

  return bits;
}

export async function getLanguageForFile(
  filepath: string,
  uri?: vscode.Uri,
): Promise<Language | undefined> {
  try {
    await Parser.init();
    const extension = path.extname(filepath).slice(1);

    let langid = EXT_LANGUAGE_MAP[extension];
    if (!langid) {
      return undefined;
    }

    return await getLanguage(langid, uri);
  } catch (e) {
    console.error("Unable to load language for file", filepath, e);
    return undefined;
  }
}

export async function getLanguage(
  langId: string,
  uri?: vscode.Uri | undefined,
): Promise<Language | undefined> {
  try {
    await Parser.init();

    await loadLanguageOndemand(langId, uri);
    return LanguageParserMap.get(langId);
  } catch (e) {
    console.error("Unable to load language for lang", langId, e);
    return undefined;
  }
}

