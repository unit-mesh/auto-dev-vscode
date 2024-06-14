/**
 * Given glob pattern, returns first non-wildcard path, rest of glob, and whether there was a leading wildcard
 */
export function splitGlob(glob: string): [string | undefined, string, boolean] {
	const segs = glob.split('/');

	let wildcards = 0;

	while (segs[0] === '**') {
		segs.shift();
		wildcards++;
	}

	return [segs.shift(), segs.join('/'), wildcards > 0];
}
