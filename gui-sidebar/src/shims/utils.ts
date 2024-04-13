import {ContextItemWithId, MessageContent, MessagePart} from "./typings";

export function stripImages(content: MessageContent): string {
    if (Array.isArray(content)) {
        return content
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("\n");
    } else {
        return content;
    }
}
export interface RangeInFileWithContents {
    filepath: string;
    range: {
        start: { line: number; character: number };
        end: { line: number; character: number };
    };
    contents: string;
}

export function contextItemToRangeInFileWithContents(
    item: ContextItemWithId,
): RangeInFileWithContents {
    const lines = item.name.split("(")[1].split(")")[0].split("-");

    const rif: RangeInFileWithContents = {
        filepath: item.description.split(" (")[0],
        range: {
            start: {
                line: parseInt(lines[0]),
                character: 0,
            },
            end: {
                line: parseInt(lines[1]),
                character: 0,
            },
        },
        contents: item.content,
    };

    return rif;
}

export function countImageTokens(content: MessagePart): number {
    if (content.type === "imageUrl") {
        return 85;
    } else {
        throw new Error("Non-image content type");
    }
}

export function getMarkdownLanguageTagForFile(filepath: string): string {
    const ext = filepath.split(".").pop();
    switch (ext) {
        case "py":
            return "python";
        case "js":
            return "javascript";
        case "jsx":
            return "jsx";
        case "tsx":
            return "tsx";
        case "ts":
            return "typescript";
        case "java":
            return "java";
        case "go":
            return "go";
        case "rb":
            return "ruby";
        case "rs":
            return "rust";
        case "c":
            return "c";
        case "cpp":
            return "cpp";
        case "cs":
            return "csharp";
        case "php":
            return "php";
        case "scala":
            return "scala";
        case "swift":
            return "swift";
        case "kt":
            return "kotlin";
        case "md":
            return "markdown";
        case "json":
            return "json";
        case "html":
            return "html";
        case "css":
            return "css";
        case "sh":
            return "shell";
        case "yaml":
            return "yaml";
        case "toml":
            return "toml";
        case "tex":
            return "latex";
        case "sql":
            return "sql";
        default:
            return "";
    }
}

export function getBasename(filepath: string, n: number = 1): string {
    return filepath.split(/[\\/]/).pop() ?? "";
}

export function getLastNPathParts(filepath: string, n: number): string {
    return filepath.split(/[\\/]/).slice(-n).join("/");
}