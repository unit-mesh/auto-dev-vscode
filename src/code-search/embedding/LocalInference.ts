import { Embedding } from "./_base/Embedding";

export class LocalInference {
	async embed(sequence: string): Promise<Embedding> {
		return Promise.resolve([]);
	}
}