type PendingResult = {
  status: "pending";
  promise: Promise<void>;
};

type FulfilledResult<T> = {
  status: "fulfilled";
  value: T;
};

type RejectedResult = {
  status: "rejected";
  error: unknown;
};

type Result<T> = PendingResult | FulfilledResult<T> | RejectedResult;

const cache = new Map<string, Result<unknown>>();

export function createResource<T>(
  key: string,
  fetcher: () => Promise<T>
): T {
  const cached = cache.get(key) as Result<T> | undefined;

  if (cached) {
    if (cached.status === "fulfilled") {
      return cached.value;
    }
    if (cached.status === "rejected") {
      throw cached.error;
    }
    // pending
    throw cached.promise;
  }

  const promise = fetcher()
    .then((value) => {
      cache.set(key, { status: "fulfilled", value });
    })
    .catch((error) => {
      cache.set(key, { status: "rejected", error });
    });

  cache.set(key, { status: "pending", promise });
  throw promise;
}

export function invalidateResource(key: string): void {
  cache.delete(key);
}

export function invalidateResourcesByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
