/**
 * A template role is a string that contains multiple sections.
 * Each section is a string that starts with "```" and ends with "```".
 * The section name is the string between "```" and "```", then will be used as the key of the section.
 * The content of the section is the string between the section name and the next section name.
 *
 * For example:
 *
 * ```settings```
 * You are a helpful assistant.
 *
 * ```user```
 * ${question}
 *
 * Will be split to:
 * {
 *    "settings": "You are a helpful assistant.",
 *    "user": "${question}"
 * }
 *
 * If the input string does not start with "```" and end with "```", it will be treated as a section named "user".
 */
export class TemplateRoleSplitter {
	static split(input: string): { [key: string]: string } {
		const sections: { [key: string]: string } = {};
		const lines = input.split('\n');
		let currentSection = '';
		let contentBuilder = '';

		for (const line of lines) {
			if (line.startsWith('```') && line.endsWith('```') && line.length > 6) {
				// Found a section header
				if (currentSection !== '') {
					sections[currentSection] = contentBuilder;
					contentBuilder = '';
				}

				currentSection = line.substring(3, line.length - 3);
			} else {
				// Append line to the current section's content
				contentBuilder += line + '\n';
			}
		}

		if (currentSection !== '') {
			sections[currentSection] = contentBuilder;
		}

		if (Object.keys(sections).length === 0) {
			sections['user'] = input;
		}

		return sections;
	}
}
