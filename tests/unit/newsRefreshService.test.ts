import { describe, expect, it, vi } from "vitest";
import {
  createNewsCacheRepository,
  type NewsKvJsonClient,
  type NewsKvSetOptions
} from "../../src/news/newsCache";
import type { GNewsProvider } from "../../src/news/gnewsProvider";
import type { NewsCountryDefinition } from "../../src/news/newsCountries";
import { refreshNewsSnapshot } from "../../src/news/newsRefreshService";
import {
  createNewsServiceError,
  type NewsSnapshot
} from "../../src/news/newsTypes";

const countries: readonly NewsCountryDefinition[] = [
  {
    code: "us",
    name: "United States",
    centroid: { latitude: 39, longitude: -98 },
    cameraHeightMeters: 5_000_000
  },
  {
    code: "gb",
    name: "United Kingdom",
    centroid: { latitude: 55, longitude: -3 },
    cameraHeightMeters: 1_500_000
  }
];

const now = () => new Date("2026-05-21T12:00:00.000Z");

const staleSnapshot: NewsSnapshot = {
  provider: "GNews",
  category: "general",
  language: "en",
  lastUpdated: "2026-05-20T12:00:00.000Z",
  countries: {
    us: {
      countryCode: "us",
      countryName: "United States",
      headlineCount: 0,
      articles: []
    }
  }
};

class MemoryKvClient implements NewsKvJsonClient {
  readonly store = new Map<string, unknown>();

  async getJson<T>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined;
  }

  async setJson<T>(
    key: string,
    value: T,
    options?: NewsKvSetOptions
  ): Promise<boolean> {
    if (options?.onlyIfAbsent && this.store.has(key)) {
      return false;
    }

    this.store.set(key, value);
    return true;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

describe("news refresh service", () => {
  it("refreshes all configured countries and updates metadata", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    const provider = createProvider((request) =>
      request.countryCode === "us"
        ? {
            articles: [
              {
                title: "US headline",
                description: "Summary",
                url: "https://example.com/us",
                publishedAt: "2026-05-21T11:00:00.000Z",
                source: { name: "Example" }
              }
            ]
          }
        : { articles: [] }
    );

    const result = await refreshNewsSnapshot({
      provider,
      cache,
      countries,
      now
    });

    expect(result).toMatchObject({ status: "refreshed", countryCount: 2 });
    expect(provider.fetchTopHeadlines).toHaveBeenCalledTimes(2);
    expect(provider.fetchTopHeadlines).toHaveBeenNthCalledWith(1, {
      countryCode: "us",
      category: "general",
      language: "en",
      max: 10
    });

    const record = await cache.getSnapshot();
    expect(record?.snapshot.countries.us.headlineCount).toBe(1);
    expect(record?.snapshot.countries.gb.headlineCount).toBe(0);
    await expect(cache.getMetadata()).resolves.toEqual({
      status: "idle",
      lastAttemptAt: "2026-05-21T12:00:00.000Z",
      lastSuccessAt: "2026-05-21T12:00:00.000Z"
    });
  });

  it("skips when the cache was already refreshed today", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    await cache.setSnapshot({
      snapshot: {
        ...staleSnapshot,
        lastUpdated: "2026-05-21T01:00:00.000Z"
      },
      refreshedAt: "2026-05-21T01:00:00.000Z"
    });
    const provider = createProvider(() => ({ articles: [] }));

    await expect(
      refreshNewsSnapshot({ provider, cache, countries, now })
    ).resolves.toEqual({ status: "skipped", reason: "fresh-cache" });
    expect(provider.fetchTopHeadlines).not.toHaveBeenCalled();
  });

  it("skips when another refresh holds the lock", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    await cache.acquireRefreshLock("2026-05-21T11:59:00.000Z");
    const provider = createProvider(() => ({ articles: [] }));

    await expect(
      refreshNewsSnapshot({ provider, cache, countries, now })
    ).resolves.toEqual({ status: "skipped", reason: "locked" });
    expect(provider.fetchTopHeadlines).not.toHaveBeenCalled();
  });

  it("stops provider calls when quota is exceeded", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    const provider = createProvider((request) => {
      if (request.countryCode === "us") {
        throw createNewsServiceError("quota-exceeded");
      }

      return { articles: [] };
    });

    await expect(
      refreshNewsSnapshot({ provider, cache, countries, now })
    ).resolves.toMatchObject({
      status: "failed",
      reason: "quota-exceeded"
    });
    expect(provider.fetchTopHeadlines).toHaveBeenCalledTimes(1);
    await expect(cache.getMetadata()).resolves.toMatchObject({
      status: "failed",
      lastFailureReason: "quota-exceeded"
    });
  });

  it("stops provider calls when GNews short-term rate limits refresh", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    const provider = createProvider((request) => {
      if (request.countryCode === "us") {
        throw createNewsServiceError("rate-limited");
      }

      return { articles: [] };
    });

    await expect(
      refreshNewsSnapshot({ provider, cache, countries, now })
    ).resolves.toMatchObject({
      status: "failed",
      reason: "rate-limited"
    });
    expect(provider.fetchTopHeadlines).toHaveBeenCalledTimes(1);
    await expect(cache.getMetadata()).resolves.toMatchObject({
      status: "failed",
      lastFailureReason: "rate-limited"
    });
  });

  it("does not overwrite the previous cache when every provider call fails", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    await cache.setSnapshot({
      snapshot: staleSnapshot,
      refreshedAt: staleSnapshot.lastUpdated
    });
    const provider = createProvider(() => {
      throw createNewsServiceError("provider-failed");
    });

    await expect(
      refreshNewsSnapshot({ provider, cache, countries, now })
    ).resolves.toMatchObject({
      status: "failed",
      reason: "provider-failed"
    });

    await expect(cache.getSnapshot()).resolves.toEqual({
      snapshot: staleSnapshot,
      refreshedAt: staleSnapshot.lastUpdated
    });
  });

  it("releases the refresh lock after failure", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    const provider = createProvider(() => {
      throw createNewsServiceError("quota-exceeded");
    });

    await refreshNewsSnapshot({ provider, cache, countries, now });

    await expect(cache.acquireRefreshLock("2026-05-21T12:05:00.000Z")).resolves.toBe(
      true
    );
  });
});

function createProvider(
  handler: (
    request: Parameters<GNewsProvider["fetchTopHeadlines"]>[0]
  ) => unknown | Promise<unknown>
): GNewsProvider {
  return {
    fetchTopHeadlines: vi.fn(async (request) => handler(request))
  };
}
