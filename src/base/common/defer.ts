interface Deferred<T> {
	abort: () => void;
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
	promise: Promise<T>;
}

export function defer<T>(signal?: AbortSignal): Deferred<T> {
	const ac = new AbortController();
	const dtd = {} as Deferred<T>;

	dtd.promise = new Promise((resolve, reject) => {
		dtd.resolve = resolve;
		dtd.reject = reject;
	});

	function onDidAbort() {
		dtd.reject(new Error('user aborted'));
	}

	ac.signal.addEventListener('abort', onDidAbort);

	if (signal) {
		signal.addEventListener('abort', onDidAbort);
	}

	dtd.abort = function () {
		ac.abort();
	};

	return dtd;
}