import type {SupportedLangId}from "./supported";
import Parser from "web-tree-sitter";

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
import Tkotlin from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-kotlin.wasm?raw";
// @ts-ignore
import Tts from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-typescript.wasm?raw";
// @ts-ignore
import Tpython from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-python.wasm?raw";
// @ts-ignore
import Trust from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-rust.wasm?raw";
// @ts-ignore
import Tswift from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-swift.wasm?raw";
// @ts-ignore
import Tlua from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-lua.wasm?raw";
// @ts-ignore
import Tzig from "@unit-mesh/treesitter-artifacts/wasm/tree-sitter-zig.wasm?raw";

const LanguageMap: Map<SupportedLangId, Parser.Language> = new Map();
async function loadLanguageOndemand(langid: SupportedLangId) {
    switch (langid) {
        case "c":
            if (!LanguageMap.has("c")) {
                LanguageMap.set("c", await Parser.Language.load(Tc));
            }
            break;
        case "cpp":
            if (!LanguageMap.has("cpp")) {
                LanguageMap.set("cpp", await Parser.Language.load(Tcpp));
            }
            break;
        case "csharp":
            if (!LanguageMap.has("csharp")) {
                LanguageMap.set("csharp", await Parser.Language.load(Tcsharp));
            }
            break;
        case "go":
            if (!LanguageMap.has("go")) {
                LanguageMap.set("go", await Parser.Language.load(Tgo));
            }
            break;
        case "java":
            if (!LanguageMap.has("java")) {

                LanguageMap.set("java", await Parser.Language.load(Tjava));
            }
            break;
        case "javascript":
            if (!LanguageMap.has("javascript")) {
                LanguageMap.set("javascript", await Parser.Language.load(Tjs));
            }
            break;
        case "kotlin":
            if (!LanguageMap.has("kotlin")) {

                LanguageMap.set("kotlin", await Parser.Language.load(Tkotlin));
            }
            break;
        case "typescript":
            if (!LanguageMap.has("typescript")) {
                LanguageMap.set("typescript", await Parser.Language.load(Tts));
            }
            break;
        case "python":
            if (!LanguageMap.has("python")) {
                LanguageMap.set("python", await Parser.Language.load(Tpython));
            }
            break;
        case "rust":
            if (!LanguageMap.has("rust")) {
                LanguageMap.set("rust", await Parser.Language.load(Trust));
            }
            break;
        case "swift":
            if (!LanguageMap.has("swift")) {
                LanguageMap.set("swift", await Parser.Language.load(Tswift));
            }
            break;
        case "lua":
            if (!LanguageMap.has("lua")) {

                LanguageMap.set("lua", await Parser.Language.load(Tlua));
            }
            break;
        case "zig":
            if (!LanguageMap.has("zig")) {
                LanguageMap.set("zig", await Parser.Language.load(Tzig));
            }
            break;
        default:
            throw new Error("Unsupported language");
        }
}

const ParserMap: Record<SupportedLangId, (source: string) => Promise<Parser.Tree>> = {
    c: async (source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("c"));
        return parser.parse(source);
    },
    cpp:async (source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("cpp"))
        return parser.parse(source);
    },
    csharp: async(source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("csharp"))
        return parser.parse(source);
    },
    go: async(source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("go"))
        return parser.parse(source);
    },
    java:async (source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("java"))
        return parser.parse(source);
    },
    javascript:async (source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("javascript"))
        return parser.parse(source);
    },
    kotlin: async(source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("kotlin"))
        return parser.parse(source);
    },
    typescript:async (source: string) => {
        console.log("typescript: ", Parser, Tts)
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("typescript"))
        return parser.parse(source);
    },
    python: async(source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("python"))
        return parser.parse(source);
    },
    rust:async (source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("rust"))
        return parser.parse(source);
    },
    swift:async (source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("swift"))
        return parser.parse(source);
    },
    zig:async (source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("zig"))
        return parser.parse(source);
    },
    lua:async (source: string) => {
        const parser = new Parser()
        parser.setLanguage(LanguageMap.get("lua"))
        return parser.parse(source);
    }
}

let inited = false;
export async function parse(langid: SupportedLangId, source: string): Promise<Parser.Tree> {
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