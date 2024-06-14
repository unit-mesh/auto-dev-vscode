import { CancellationToken } from 'vscode';

export function withCancellation<T>(promise: Promise<T>, cancellationToken: CancellationToken, result: T): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const cancellationListener = cancellationToken.onCancellationRequested(() => {
			cancellationListener.dispose();
			resolve(result);
		});
		promise.then(resolve, reject).finally(() => cancellationListener.dispose());
	});
}
