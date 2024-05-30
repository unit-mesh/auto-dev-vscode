/**
 * Copyright (c) 2021-2024 Axosoft, LLC dba GitKraken ("GitKraken")
 * Copyright (c) 2016-2021 Eric Amodio
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export type Parser<T> = {
	arguments: string[];
	parse: (data: string | string[]) => Generator<T>;
};

export type ExtractAll<T, U> = { [K in keyof T]: T[K] extends U ? T[K] : never };

export function* getLines(data: string | string[], char: string = '\n'): IterableIterator<string> {
	if (typeof data === 'string') {
		let i = 0;
		while (i < data.length) {
			let j = data.indexOf(char, i);
			if (j === -1) {
				j = data.length;
			}

			yield data.substring(i, j);
			i = j + 1;
		}

		return;
	}

	let count = 0;
	let leftover: string | undefined;
	for (let s of data) {
		count++;
		if (leftover) {
			s = leftover + s;
			leftover = undefined;
		}

		let i = 0;
		while (i < s.length) {
			let j = s.indexOf(char, i);
			if (j === -1) {
				if (count === data.length) {
					j = s.length;
				} else {
					leftover = s.substring(i);
					break;
				}
			}

			yield s.substring(i, j);
			i = j + 1;
		}
	}
}

export function createLogParser<
	T extends Record<string, unknown>,
	TAdditional extends Record<string, unknown> = Record<string, unknown>,
>(
	fieldMapping: ExtractAll<T, string>,
	options?: {
		additionalArgs?: string[];
		parseEntry?: (fields: IterableIterator<string>, entry: T & TAdditional) => void;
		prefix?: string;
		fieldPrefix?: string;
		fieldSuffix?: string;
		separator?: string;
		skip?: number;
	},
): Parser<T & TAdditional> {
	let format = options?.prefix ?? '';
	const keys: (keyof ExtractAll<T, string>)[] = [];
	for (const key in fieldMapping) {
		keys.push(key);
		format += `${options?.fieldPrefix ?? ''}${fieldMapping[key]}${
			options?.fieldSuffix ?? (options?.fieldPrefix == null ? '%x00' : '')
		}`;
	}

	const args = ['-z', `--format=${format}`];
	if (options?.additionalArgs != null && options.additionalArgs.length > 0) {
		args.push(...options.additionalArgs);
	}

	function* parse(data: string | string[]): Generator<T & TAdditional> {
		let entry: T & TAdditional = {} as any;
		let fieldCount = 0;
		let field;

		const fields = getLines(data, options?.separator ?? '\0');
		if (options?.skip) {
			for (let i = 0; i < options.skip; i++) {
				field = fields.next();
			}
		}

		while (true) {
			field = fields.next();
			if (field.done) break;

			entry[keys[fieldCount++]] = field.value as (T & TAdditional)[keyof T];

			if (fieldCount === keys.length) {
				fieldCount = 0;
				field = fields.next();

				options?.parseEntry?.(fields, entry);
				yield entry;

				entry = {} as any;
			}
		}
	}

	return { arguments: args, parse: parse };
}
