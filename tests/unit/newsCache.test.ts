import { describe, expect, it } from "vitest";
import {
  createNewsCacheRepository,
  createVercelKvRestJsonClient,
  NEWS_CACHE_KEYS,
  NEWS_REFRESH_LOCK_TTL_SECONDS,
  NEWS_SNAPSHOT_TTL_SECONDS,
  type NewsKvJsonClient,
  type NewsKvSetOptions
} from "../../src/news/newsCache";
import type { NewsSnapshot } from "../../src/news/newsTypes";

const snapshot: NewsSnapshot = {
  provider: "GNews",
  category: "general",
  language: "mixed",
  lastUpdated: "2026-05-21T00:00:00.000Z",
  countries: {
    us: {
      countryCode: "us",
      countryName: "United States",
      language: "en",
      headlineCount: 0,
      articles: []
    }
  }
};

class MemoryKvClient implements NewsKvJsonClient {
  readonly store = new Map<string, unknown>();
  readonly setOptions = new Map<string, NewsKvSetOptions | undefined>();
  failSetKey: string | undefined;

  async getJson<T>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined;
  }

  async setJson<T>(
    key: string,
    value: T,
    options?: NewsKvSetOptions
  ): Promise<boolean> {
    if (this.failSetKey === key) {
      throw new Error("set failed");
    }

    if (options?.onlyIfAbsent && this.store.has(key)) {
      return false;
    }

    this.store.set(key, value);
    this.setOptions.set(key, options);
    return true;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

describe("news cache repository", () => {
  it("returns cache hits and misses", async () => {
    const kv = new MemoryKvClient();
    const cache = createNewsCacheRepository(kv);

    await expect(cache.getSnapshot()).resolves.toBeUndefined();

    await cache.setSnapshot({ snapshot, refreshedAt: snapshot.lastUpdated });

    await expect(cache.getSnapshot()).resolves.toEqual({
      snapshot,
      refreshedAt: snapshot.lastUpdated
    });
    expect(kv.setOptions.get(NEWS_CACHE_KEYS.activeSnapshot)?.ttlSeconds).toBe(
      NEWS_SNAPSHOT_TTL_SECONDS
    );
  });

  it("returns default metadata and stores failure metadata", async () => {
    const kv = new MemoryKvClient();
    const cache = createNewsCacheRepository(kv);

    await expect(cache.getMetadata()).resolves.toEqual({ status: "idle" });

    await cache.setMetadata({
      status: "failed",
      lastAttemptAt: "2026-05-21T00:00:00.000Z",
      lastFailureReason: "quota-exceeded"
    });

    await expect(cache.getMetadata()).resolves.toEqual({
      status: "failed",
      lastAttemptAt: "2026-05-21T00:00:00.000Z",
      lastFailureReason: "quota-exceeded"
    });
  });

  it("uses an expiring refresh lock to prevent duplicate refreshes", async () => {
    const kv = new MemoryKvClient();
    const cache = createNewsCacheRepository(kv);

    await expect(cache.acquireRefreshLock("2026-05-21T00:00:00.000Z")).resolves.toBe(
      true
    );
    await expect(cache.acquireRefreshLock("2026-05-21T00:01:00.000Z")).resolves.toBe(
      false
    );
    expect(kv.setOptions.get(NEWS_CACHE_KEYS.refreshLock)).toEqual({
      ttlSeconds: NEWS_REFRESH_LOCK_TTL_SECONDS,
      onlyIfAbsent: true
    });

    await cache.releaseRefreshLock();
    await expect(cache.acquireRefreshLock("2026-05-21T00:02:00.000Z")).resolves.toBe(
      true
    );
  });

  it("preserves the previous snapshot when a write fails", async () => {
    const kv = new MemoryKvClient();
    const cache = createNewsCacheRepository(kv);

    await cache.setSnapshot({ snapshot, refreshedAt: snapshot.lastUpdated });
    kv.failSetKey = NEWS_CACHE_KEYS.activeSnapshot;

    await expect(
      cache.setSnapshot({
        snapshot: {
          ...snapshot,
          lastUpdated: "2026-05-22T00:00:00.000Z"
        },
        refreshedAt: "2026-05-22T00:00:00.000Z"
      })
    ).rejects.toThrow("set failed");

    await expect(cache.getSnapshot()).resolves.toEqual({
      snapshot,
      refreshedAt: snapshot.lastUpdated
    });
  });

  it("uses Vercel KV REST-compatible commands", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = (async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(url), init });

      if (String(url).includes("/get/")) {
        return new Response(JSON.stringify({ result: JSON.stringify({ ok: true }) }));
      }

      return new Response(JSON.stringify({ result: "OK" }));
    }) as typeof fetch;
    const client = createVercelKvRestJsonClient({
      url: "https://kv.example.com/",
      token: "kv-token",
      fetcher
    });

    await expect(client.getJson("my:key")).resolves.toEqual({ ok: true });
    await expect(
      client.setJson("my:key", { value: 1 }, { ttlSeconds: 60, onlyIfAbsent: true })
    ).resolves.toBe(true);
    await client.delete("my:key");

    expect(calls[0].url).toBe("https://kv.example.com/get/my%3Akey");
    expect(calls[1].url).toContain("https://kv.example.com/set/my%3Akey/");
    expect(calls[1].url).toContain("/EX/60/NX");
    expect(calls[1].init?.headers).toEqual({
      Authorization: "Bearer kv-token"
    });
    expect(calls[2].url).toBe("https://kv.example.com/del/my%3Akey");
  });
});
