import type { NewsSnapshot, NewsUnavailableReason } from "./newsTypes.js";
import { isIsoTimestamp, isNewsSnapshot, isNewsUnavailableReason } from "./newsTypes.js";

export type NewsCacheRecord = {
  snapshot: NewsSnapshot;
  refreshedAt: string;
};

export type NewsRefreshMetadata = {
  status: "idle" | "refreshing" | "failed";
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastFailureReason?: NewsUnavailableReason;
};

export type NewsCacheRepository = {
  getSnapshot(): Promise<NewsCacheRecord | undefined>;
  setSnapshot(record: NewsCacheRecord): Promise<void>;
  getMetadata(): Promise<NewsRefreshMetadata>;
  setMetadata(metadata: NewsRefreshMetadata): Promise<void>;
  acquireRefreshLock(nowIso: string): Promise<boolean>;
  releaseRefreshLock(): Promise<void>;
};

export type NewsKvSetOptions = {
  ttlSeconds?: number;
  onlyIfAbsent?: boolean;
};

export type NewsKvJsonClient = {
  getJson<T>(key: string): Promise<T | undefined>;
  setJson<T>(key: string, value: T, options?: NewsKvSetOptions): Promise<boolean>;
  delete(key: string): Promise<void>;
};

export type VercelKvRestClientOptions = {
  url: string;
  token: string;
  fetcher?: typeof fetch;
};

export const NEWS_CACHE_KEYS = {
  activeSnapshot: "myearth:news:snapshot:active",
  metadata: "myearth:news:metadata",
  refreshLock: "myearth:news:refresh-lock"
} as const;

export const NEWS_SNAPSHOT_TTL_SECONDS = 60 * 60 * 48;
export const NEWS_REFRESH_LOCK_TTL_SECONDS = 60 * 15;

const DEFAULT_METADATA: NewsRefreshMetadata = { status: "idle" };

export function createNewsCacheRepository(
  kvClient: NewsKvJsonClient
): NewsCacheRepository {
  return {
    async getSnapshot() {
      const record = await kvClient.getJson<unknown>(NEWS_CACHE_KEYS.activeSnapshot);
      return isNewsCacheRecord(record) ? record : undefined;
    },

    async setSnapshot(record) {
      await kvClient.setJson(NEWS_CACHE_KEYS.activeSnapshot, record, {
        ttlSeconds: NEWS_SNAPSHOT_TTL_SECONDS
      });
    },

    async getMetadata() {
      const metadata = await kvClient.getJson<unknown>(NEWS_CACHE_KEYS.metadata);
      return isNewsRefreshMetadata(metadata) ? metadata : DEFAULT_METADATA;
    },

    async setMetadata(metadata) {
      await kvClient.setJson(NEWS_CACHE_KEYS.metadata, metadata);
    },

    async acquireRefreshLock(nowIso) {
      if (!isIsoTimestamp(nowIso)) {
        return false;
      }

      return kvClient.setJson(
        NEWS_CACHE_KEYS.refreshLock,
        { acquiredAt: nowIso },
        {
          ttlSeconds: NEWS_REFRESH_LOCK_TTL_SECONDS,
          onlyIfAbsent: true
        }
      );
    },

    async releaseRefreshLock() {
      await kvClient.delete(NEWS_CACHE_KEYS.refreshLock);
    }
  };
}

export function createVercelKvNewsCache(
  options: VercelKvRestClientOptions
): NewsCacheRepository {
  return createNewsCacheRepository(createVercelKvRestJsonClient(options));
}

export function createVercelKvRestJsonClient(
  options: VercelKvRestClientOptions
): NewsKvJsonClient {
  const baseUrl = options.url.trim().replace(/\/+$/, "");
  const token = options.token.trim();
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);

  return {
    async getJson<T>(key: string): Promise<T | undefined> {
      const payload = await requestKv<{ result: unknown }>(
        fetcher,
        token,
        `${baseUrl}/get/${encodePathPart(key)}`
      );

      if (payload.result === null || payload.result === undefined) {
        return undefined;
      }

      if (typeof payload.result === "string") {
        return JSON.parse(payload.result) as T;
      }

      return payload.result as T;
    },

    async setJson<T>(
      key: string,
      value: T,
      setOptions: NewsKvSetOptions = {}
    ): Promise<boolean> {
      const pathParts = [
        "set",
        key,
        JSON.stringify(value)
      ];

      if (setOptions.ttlSeconds !== undefined) {
        pathParts.push("EX", String(setOptions.ttlSeconds));
      }

      if (setOptions.onlyIfAbsent) {
        pathParts.push("NX");
      }

      const payload = await requestKv<{ result: unknown }>(
        fetcher,
        token,
        `${baseUrl}/${pathParts.map(encodePathPart).join("/")}`,
        { method: "POST" }
      );

      return payload.result === "OK";
    },

    async delete(key: string): Promise<void> {
      await requestKv<{ result: unknown }>(
        fetcher,
        token,
        `${baseUrl}/del/${encodePathPart(key)}`,
        { method: "POST" }
      );
    }
  };
}

export type VercelKvNewsCacheRepositoryOptions = {
  restApiUrl: string;
  restApiToken: string;
  fetcher?: typeof fetch;
};

export function createVercelKvNewsCacheRepository(
  options: VercelKvNewsCacheRepositoryOptions
): NewsCacheRepository {
  return createVercelKvNewsCache({
    url: options.restApiUrl,
    token: options.restApiToken,
    fetcher: options.fetcher
  });
}

export function createMemoryNewsCacheRepository(
  initialRecord?: NewsCacheRecord
): NewsCacheRepository {
  const store = new Map<string, unknown>();

  if (initialRecord) {
    store.set(NEWS_CACHE_KEYS.activeSnapshot, initialRecord);
  }

  return createNewsCacheRepository({
    async getJson<T>(key: string) {
      return store.get(key) as T | undefined;
    },

    async setJson<T>(
      key: string,
      value: T,
      options?: NewsKvSetOptions
    ): Promise<boolean> {
      if (options?.onlyIfAbsent && store.has(key)) {
        return false;
      }

      store.set(key, value);
      return true;
    },

    async delete(key: string) {
      store.delete(key);
    }
  });
}

function isNewsCacheRecord(value: unknown): value is NewsCacheRecord {
  return (
    isRecord(value) &&
    isNewsSnapshot(value.snapshot) &&
    isIsoTimestamp(value.refreshedAt)
  );
}

function isNewsRefreshMetadata(value: unknown): value is NewsRefreshMetadata {
  if (!isRecord(value)) {
    return false;
  }

  const statusIsValid =
    value.status === "idle" || value.status === "refreshing" || value.status === "failed";

  return (
    statusIsValid &&
    (value.lastAttemptAt === undefined || isIsoTimestamp(value.lastAttemptAt)) &&
    (value.lastSuccessAt === undefined || isIsoTimestamp(value.lastSuccessAt)) &&
    (value.lastFailureReason === undefined ||
      isNewsUnavailableReason(value.lastFailureReason))
  );
}

async function requestKv<T>(
  fetcher: typeof fetch,
  token: string,
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetcher(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Vercel KV request failed.");
  }

  const payload = (await response.json()) as { error?: string };

  if (payload.error) {
    throw new Error("Vercel KV command failed.");
  }

  return payload as T;
}

function encodePathPart(value: string): string {
  return encodeURIComponent(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
