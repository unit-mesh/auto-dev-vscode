import type {SupportedLangId}from "./supported";
import Parser from "tree-sitter";
// @ts-ignore
import Tc from "tree-sitter-c";
// @ts-ignore
import Tcpp from "tree-sitter-cpp";
// @ts-ignore
import Tcsharp from "tree-sitter-csharp";
// @ts-ignore
import Tgo from "tree-sitter-go";
// @ts-ignore
import Tjava from "tree-sitter-java";
// @ts-ignore
import Tjs from "tree-sitter-javascript";
// @ts-ignore
import Tkotlin from "tree-sitter-kotlin";
// @ts-ignore
import Tts from "tree-sitter-typescript";
// @ts-ignore
import Tpython from "tree-sitter-python";
// @ts-ignore
import Trust from "tree-sitter-rust";
// @ts-ignore
import Tswift from "tree-sitter-swift";
// @ts-ignore
import Tzig from "tree-sitter-zig";
// @ts-ignore
import Tlua from "tree-sitter-lua";

const ParserMap: Record<SupportedLangId, (source: string) => Parser.Tree> = {
    c: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tc);
        return parser.parse(source);
    },
    cpp: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tcpp)
        return parser.parse(source);
    },
    csharp: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tcsharp)
        return parser.parse(source);
    },
    go: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tgo)
        return parser.parse(source);
    },
    java: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tjava)
        return parser.parse(source);
    },
    javascript: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tjs)
        return parser.parse(source);
    },
    kotlin: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tkotlin)
        return parser.parse(source);
    },
    typescript: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tts)
        return parser.parse(source);
    },
    python: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tpython)
        return parser.parse(source);
    },
    rust: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Trust)
        return parser.parse(source);
    },
    swift: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tswift)
        return parser.parse(source);
    },
    zig: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tzig)
        return parser.parse(source);
    },
    lua: (source: string) => {
        const parser = new Parser()
        parser.setLanguage(Tlua)
        return parser.parse(source);
    }
}

export function parse(langid: SupportedLangId, source: string): Parser.Tree {
    if (!ParserMap[langid]) {
        throw new Error(`Unsupported language: ${langid}`);
    }

    return ParserMap[langid](source);
}