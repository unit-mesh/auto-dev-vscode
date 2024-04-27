export function cleanFragment(
	fragment: string | undefined,
): string | undefined {
	if (!fragment) {
		return undefined;
	}

	// Remove leading and trailing whitespaces
	fragment = fragment.trim();

	// If there's a ](, which would mean a link, remove everything after it
	const parenIndex = fragment.indexOf("](");
	if (parenIndex !== -1) {
		fragment = fragment.slice(0, parenIndex);
	}

	// Remove all special characters except alphanumeric, hyphen, space, and underscore
	fragment = fragment.replace(/[^\w-\s]/g, "").trim();

	// Convert to lowercase
	fragment = fragment.toLowerCase();

	// Replace spaces with hyphens
	fragment = fragment.replace(/\s+/g, "-");

	return fragment;
}

export function cleanHeader(header: string | undefined): string | undefined {
	if (!header) {
		return undefined;
	}

	// Remove leading and trailing whitespaces
	header = header.trim();

	// If there's a (, remove everything after it
	const parenIndex = header.indexOf("(");
	if (parenIndex !== -1) {
		header = header.slice(0, parenIndex);
	}

	// Remove all special characters except alphanumeric, hyphen, space, and underscore
	header = header
		.replace(/[^\w-\s]/g, "")
		.replace("¶", "")
		.trim();

	return header;
}

function findHeader(lines: string[]): string | undefined {
	return lines.find((line) => line.startsWith("#"))?.split("# ")[1];
}
