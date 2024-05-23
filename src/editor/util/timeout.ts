export const TIMEOUT_ERROR = Symbol("timeout");

export async function timeout<T = unknown>(
  thenable: Promise<T>,
  ms?: number | undefined
): Promise<T> {
  let timer: NodeJS.Timeout | null = null;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(reject, ms, TIMEOUT_ERROR);
  });

  return Promise.race([thenable, timeout]).finally(() => {
    timer && clearTimeout(timer);
  });
}

export async function timeoutSafe<T = unknown>(
  thenable: Promise<T>
): Promise<T | undefined>;

export async function timeoutSafe<T = unknown>(
  thenable: Promise<T>,
  ms: number | undefined,
  fallback: T
): Promise<T>;

export async function timeoutSafe<T = unknown>(
  thenable: Promise<T>,
  ms?: number | undefined,
  fallback?: T
): Promise<T | undefined> {
  return timeout<T>(thenable, ms).catch((error) => {
    if (error === TIMEOUT_ERROR) return fallback;
    throw error;
  });
}
