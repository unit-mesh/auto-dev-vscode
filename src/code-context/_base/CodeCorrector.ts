export interface CodeCorrector {
	/**
	 * Corrects the generate AI code.
	 * @param code The code to correct.
	 * @returns The corrected code.
	 */
	correct(code: string): Promise<void>;
}