import { Buffer } from 'node:buffer'
import Parser from 'web-tree-sitter'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tc from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-c.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tcpp from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-cpp.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tcsharp from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-c_sharp.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tgo from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-go.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tjava from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-java.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tjs from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-javascript.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tkotlin from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-kotlin.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tts from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-typescript.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tpython from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-python.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Trust from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-rust.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tswift from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-swift.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tlua from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-lua.wasm?raw'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Tzig from '@unit-mesh/treesitter-artifacts/wasm/tree-sitter-zig.wasm?raw'

import type { SupportedLangId } from './supported'

const PREFIX = 'data:application/wasm;base64,'
const LanguageMap: Map<SupportedLangId, Parser.Language> = new Map()
async function loadLanguageOndemand(langid: SupportedLangId) {
  switch (langid) {
    case 'c':
      if (!LanguageMap.has('c')) {
        const result = new Uint8Array(Buffer.from(Tc.substring(PREFIX.length), 'base64'))
        LanguageMap.set('c', await Parser.Language.load(result))
      }
      break
    case 'cpp':
      if (!LanguageMap.has('cpp')) {
        const result = new Uint8Array(Buffer.from(Tcpp.substring(PREFIX.length), 'base64'))
        LanguageMap.set('cpp', await Parser.Language.load(result))
      }
      break
    case 'csharp':
      if (!LanguageMap.has('csharp')) {
        const result = new Uint8Array(Buffer.from(Tcsharp.substring(PREFIX.length), 'base64'))
        LanguageMap.set('csharp', await Parser.Language.load(result))
      }
      break
    case 'go':
      if (!LanguageMap.has('go')) {
        const result = new Uint8Array(Buffer.from(Tgo.substring(PREFIX.length), 'base64'))
        LanguageMap.set('go', await Parser.Language.load(result))
      }
      break
    case 'java':
      if (!LanguageMap.has('java')) {
        const result = new Uint8Array(Buffer.from(Tjava.substring(PREFIX.length), 'base64'))
        LanguageMap.set('java', await Parser.Language.load(result))
      }
      break
    case 'javascript':
      if (!LanguageMap.has('javascript')) {
        const result = new Uint8Array(Buffer.from(Tjs.substring(PREFIX.length), 'base64'))
        LanguageMap.set('javascript', await Parser.Language.load(result))
      }
      break
    case 'kotlin':
      if (!LanguageMap.has('kotlin')) {
        const result = new Uint8Array(Buffer.from(Tkotlin.substring(PREFIX.length), 'base64'))
        LanguageMap.set('kotlin', await Parser.Language.load(result))
      }
      break
    case 'typescript':
      if (!LanguageMap.has('typescript')) {
        const result = new Uint8Array(Buffer.from(Tts.substring(PREFIX.length), 'base64'))
        LanguageMap.set('typescript', await Parser.Language.load(result))
      }
      break
    case 'python':
      if (!LanguageMap.has('python')) {
        const result = new Uint8Array(Buffer.from(Tpython.substring(PREFIX.length), 'base64'))
        LanguageMap.set('python', await Parser.Language.load(result))
      }
      break
    case 'rust':
      if (!LanguageMap.has('rust')) {
        const result = new Uint8Array(Buffer.from(Trust.substring(PREFIX.length), 'base64'))
        LanguageMap.set('rust', await Parser.Language.load(result))
      }
      break
    case 'swift':
      if (!LanguageMap.has('swift')) {
        const result = new Uint8Array(Buffer.from(Tswift.substring(PREFIX.length), 'base64'))
        LanguageMap.set('swift', await Parser.Language.load(result))
      }
      break
    case 'lua':
      if (!LanguageMap.has('lua')) {
        const result = new Uint8Array(Buffer.from(Tlua.substring(PREFIX.length), 'base64'))
        LanguageMap.set('lua', await Parser.Language.load(result))
      }
      break
    case 'zig':
      if (!LanguageMap.has('zig')) {
        const result = new Uint8Array(Buffer.from(Tzig.substring(PREFIX.length), 'base64'))
        LanguageMap.set('zig', await Parser.Language.load(result))
      }
      break
    default:
      throw new Error('Unsupported language')
  }
}

const ParserMap: Record<SupportedLangId, (source: string) => Promise<Parser.Tree>> = {
  c: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('c'))
    return parser.parse(source)
  },
  cpp: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('cpp'))
    return parser.parse(source)
  },
  csharp: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('csharp'))
    return parser.parse(source)
  },
  go: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('go'))
    return parser.parse(source)
  },
  java: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('java'))
    return parser.parse(source)
  },
  javascript: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('javascript'))
    return parser.parse(source)
  },
  kotlin: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('kotlin'))
    return parser.parse(source)
  },
  typescript: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('typescript'))
    return parser.parse(source)
  },
  python: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('python'))
    return parser.parse(source)
  },
  rust: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('rust'))
    return parser.parse(source)
  },
  swift: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('swift'))
    return parser.parse(source)
  },
  zig: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('zig'))
    return parser.parse(source)
  },
  lua: async (source: string) => {
    const parser = new Parser()
    parser.setLanguage(LanguageMap.get('lua'))
    return parser.parse(source)
  },
}

let inited = false
export async function parse(langid: SupportedLangId, source: string): Promise<Parser.Tree> {
  if (!inited) {
    await Parser.init()
    inited = true
  }

  if (!ParserMap[langid])
    throw new Error(`Unsupported language: ${langid}`)

  await loadLanguageOndemand(langid)
  return ParserMap[langid](source)
}
