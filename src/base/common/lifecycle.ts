export interface IDisposable {
	dispose(): void;
}

/**
 * Check if `thing` is {@link IDisposable disposable}.
 */
export function isDisposable<E extends any>(thing: E): thing is E & IDisposable {
	return (
		typeof thing === 'object' &&
		thing !== null &&
		typeof (<IDisposable>(<any>thing)).dispose === 'function' &&
		(<IDisposable>(<any>thing)).dispose.length === 0
	);
}
