import { extensionLanguageMap, type SupportedLanguage } from "./supported";
import Parser, { Language } from "web-tree-sitter";
import fs from "fs";

// @ts-ignore
import Tc from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-c.wasm?raw";
// @ts-ignore
import Tcpp from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-cpp.wasm?raw";
// @ts-ignore
import Tcsharp from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-c_sharp.wasm?raw";
// @ts-ignore
import Tgo from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-go.wasm?raw";
// @ts-ignore
import Tjava from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-java.wasm?raw";
// @ts-ignore
import Tjs from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-javascript.wasm?raw";
// @ts-ignore
import Tts from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-typescript.wasm?raw";
// @ts-ignore
import Tpython from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-python.wasm?raw";
// @ts-ignore
import Trust from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-rust.wasm?raw";
import path from "path";

const PREFIX = "data:application/wasm;base64,";
const LanguageMap: Map<SupportedLanguage, Parser.Language> = new Map();
async function loadLanguageOndemand(langid: SupportedLanguage) {
  switch (langid) {
    case "c":
      if (!LanguageMap.has("c")) {
        const result = new Uint8Array(
          Buffer.from(Tc.substring(PREFIX.length), "base64")
        );
        LanguageMap.set("c", await Parser.Language.load(result));
      }
      break;
    case "cpp":
      if (!LanguageMap.has("cpp")) {
        const result = new Uint8Array(
          Buffer.from(Tcpp.substring(PREFIX.length), "base64")
        );
        LanguageMap.set("cpp", await Parser.Language.load(result));
      }
      break;
    case "csharp":
      if (!LanguageMap.has("csharp")) {
        const result = new Uint8Array(
          Buffer.from(Tcsharp.substring(PREFIX.length), "base64")
        );
        LanguageMap.set("csharp", await Parser.Language.load(result));
      }
      break;
    case "go":
      if (!LanguageMap.has("go")) {
        const result = new Uint8Array(
          Buffer.from(Tgo.substring(PREFIX.length), "base64")
        );
        LanguageMap.set("go", await Parser.Language.load(result));
      }
      break;
    case "java":
      if (!LanguageMap.has("java")) {
        const result = new Uint8Array(
          Buffer.from(Tjava.substring(PREFIX.length), "base64")
        );
        LanguageMap.set("java", await Parser.Language.load(result));
      }
      break;
    case "javascript":
      if (!LanguageMap.has("javascript")) {
        const result = new Uint8Array(
          Buffer.from(Tjs.substring(PREFIX.length), "base64")
        );
        LanguageMap.set("javascript", await Parser.Language.load(result));
      }
      break;
    case "typescript":
      if (!LanguageMap.has("typescript")) {
        const result = new Uint8Array(
          Buffer.from(Tts.substring(PREFIX.length), "base64")
        );
        LanguageMap.set("typescript", await Parser.Language.load(result));
      }
      break;
    case "python":
      if (!LanguageMap.has("python")) {
        const result = new Uint8Array(
          Buffer.from(Tpython.substring(PREFIX.length), "base64")
        );
        LanguageMap.set("python", await Parser.Language.load(result));
      }
      break;
    case "rust":
      if (!LanguageMap.has("rust")) {
        const result = new Uint8Array(
          Buffer.from(Trust.substring(PREFIX.length), "base64")
        );
        LanguageMap.set("rust", await Parser.Language.load(result));
      }
      break;
    default:
      throw new Error("Unsupported language");
  }
}

const ParserMap: Record<
  SupportedLanguage,
  (source: string) => Promise<Parser.Tree>
> = {
  c: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageMap.get("c"));
    return parser.parse(source);
  },
  cpp: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageMap.get("cpp"));
    return parser.parse(source);
  },
  csharp: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageMap.get("csharp"));
    return parser.parse(source);
  },
  go: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageMap.get("go"));
    return parser.parse(source);
  },
  java: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageMap.get("java"));
    return parser.parse(source);
  },
  javascript: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageMap.get("javascript"));
    return parser.parse(source);
  },
  typescript: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageMap.get("typescript"));
    return parser.parse(source);
  },
  python: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageMap.get("python"));
    return parser.parse(source);
  },
  rust: async (source: string) => {
    const parser = new Parser();
    parser.setLanguage(LanguageMap.get("rust"));
    return parser.parse(source);
  },
};

let inited = false;
export async function parse(
  langid: SupportedLanguage,
  source: string
): Promise<Parser.Tree> {
  if (!inited) {
    await Parser.init();
    inited = true;
  }

  if (!ParserMap[langid]) {
    throw new Error(`Unsupported language: ${langid}`);
  }

  await loadLanguageOndemand(langid);
  return ParserMap[langid](source);
}

export async function getLanguageForFile(
  filepath: string
): Promise<Language | undefined> {
  try {
    await Parser.init();
    const extension = path.extname(filepath).slice(1);

    if (!extensionLanguageMap[extension]) {
      return undefined;
    }

    const wasmPath = path.join(
      __dirname,
      "tree-sitter-wasms",
      `tree-sitter-${extensionLanguageMap[extension]}.wasm`
    );

    const language = await Parser.Language.load(wasmPath);
    return language;
  } catch (e) {
    console.error("Unable to load language for file", filepath, e);
    return undefined;
  }
}

export async function getLanguage(
  langId: string
): Promise<Language | undefined> {
  try {
    await Parser.init();
    const wasmPath = path.join(
      __dirname,
      "tree-sitter-wasms",
      `tree-sitter-${langId}.wasm`
    );

    const language = await Parser.Language.load(wasmPath);
    return language;
  } catch (e) {
    console.error("Unable to load language for lang", langId, e);
    return undefined;
  }
}

export async function getParserForFile(filepath: string) {
  if (process.env.IS_BINARY) {
    return undefined;
  }

  try {
    await Parser.init();
    const parser = new Parser();

    const language = await getLanguageForFile(filepath);
    parser.setLanguage(language);

    return parser;
  } catch (e) {
    console.error("Unable to load language for file", filepath, e);
    return undefined;
  }
}

export function getQuerySource(filepath: string) {
  const fullLangName = extensionLanguageMap[filepath.split(".").pop() ?? ""];
  const sourcePath = path.join(__dirname, "semantic", `${fullLangName}.scm`);
  if (!fs.existsSync(sourcePath)) {
    throw new Error("cannot find file:" + sourcePath);
  }

  return fs.readFileSync(sourcePath).toString();
}

export async function getSnippetsInFile(
  filepath: string,
  contents: string
): Promise<(any & { title: string })[]> {
  const lang = await getLanguageForFile(filepath);
  if (!lang) {
    return [];
  }
  const parser = await getParserForFile(filepath);
  if (!parser) {
    return [];
  }
  const ast = parser.parse(contents);
  const query = lang?.query(getQuerySource(filepath));
  const matches = query?.matches(ast.rootNode);

  return (
    matches?.flatMap((match) => {
      const node = match.captures[0].node;
      const title = match.captures[1].node.text;
      const results = {
        title,
        content: node.text,
        startLine: node.startPosition.row,
        endLine: node.endPosition.row,
      };
      return results;
    }) ?? []
  );
}

export async function getAst(
  filepath: string,
  fileContents: string
): Promise<Parser.Tree | undefined> {
  const parser = await getParserForFile(filepath);

  if (!parser) {
    return undefined;
  }

  try {
    const ast = parser.parse(fileContents);
    return ast;
  } catch (e) {
    return undefined;
  }
}

export async function getTreePathAtCursor(
  ast: Parser.Tree,
  cursorIndex: number
): Promise<Parser.SyntaxNode[] | undefined> {
  const path = [ast.rootNode];
  while (path[path.length - 1].childCount > 0) {
    let foundChild = false;
    for (let child of path[path.length - 1].children) {
      if (child.startIndex <= cursorIndex && child.endIndex >= cursorIndex) {
        path.push(child);
        foundChild = true;
        break;
      }
    }

    if (!foundChild) {
      break;
    }
  }

  return path;
}
