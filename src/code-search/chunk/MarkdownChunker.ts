import { ChunkWithoutID } from "./Chunk";
import { cleanFragment, cleanHeader } from "../../markdown/MarkdownClean";
import { countTokens } from "../token/TokenCounter";
import { basicChunker } from "./util/ChunkDocument";

export async function* markdownChunker(
	content: string,
	maxChunkSize: number,
	hLevel: number,
): AsyncGenerator<ChunkWithoutID> {
	if (countTokens(content) <= maxChunkSize) {
		const header = findHeader(content.split("\n"));
		yield {
			content,
			startLine: 0,
			endLine: content.split("\n").length,
			otherMetadata: {
				fragment: cleanFragment(header),
				title: cleanHeader(header),
			},
		};
		return;
	} else if (hLevel > 4) {
		const header = findHeader(content.split("\n"));

		for (const chunk of basicChunker(content, maxChunkSize)) {
			yield {
				...chunk,
				otherMetadata: {
					fragment: cleanFragment(header),
					title: cleanHeader(header),
				},
			};
		}
		return;
	}

	const h = "#".repeat(hLevel + 1) + " ";
	const lines = content.split("\n");
	const sections = [];

	let currentSectionStartLine = 0;
	let currentSection: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith(h) || i === 0) {
			if (currentSection.length) {
				const isHeader = currentSection[0].startsWith(h);
				sections.push({
					header: isHeader ? currentSection[0] : findHeader(currentSection),
					content: currentSection.slice(isHeader ? 1 : 0).join("\n"),
					startLine: currentSectionStartLine,
					endLine: currentSectionStartLine + currentSection.length,
				});
			}
			currentSection = [lines[i]];
			currentSectionStartLine = i;
		} else {
			currentSection.push(lines[i]);
		}
	}

	if (currentSection.length) {
		const isHeader = currentSection[0].startsWith(h);
		sections.push({
			header: isHeader ? currentSection[0] : findHeader(currentSection),
			content: currentSection.slice(isHeader ? 1 : 0).join("\n"),
			startLine: currentSectionStartLine,
			endLine: currentSectionStartLine + currentSection.length,
		});
	}

	for (const section of sections) {
		for await (const chunk of markdownChunker(
			section.content,
			maxChunkSize - (section.header ? countTokens(section.header) : 0),
			hLevel + 1,
		)) {
			yield {
				content: section.header + "\n" + chunk.content,
				startLine: section.startLine + chunk.startLine,
				endLine: section.startLine + chunk.endLine,
				otherMetadata: {
					fragment:
						chunk.otherMetadata?.fragment || cleanFragment(section.header),
					title: chunk.otherMetadata?.title || cleanHeader(section.header),
				},
			};
		}
	}
}

function findHeader(lines: string[]): string | undefined {
	return lines.find((line) => line.startsWith("#"))?.split("# ")[1];
}
