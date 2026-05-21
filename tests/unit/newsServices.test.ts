import { describe, expect, it, vi } from "vitest";
import { getNewsApiResponse } from "../../api/news";
import { refreshNewsApi } from "../../api/news/refresh";
import { createGNewsProvider } from "../../src/news/gnewsProvider";
import {
  createMemoryNewsCacheRepository,
  createVercelKvNewsCacheRepository
} from "../../src/news/newsCache";
import { listNewsCountries } from "../../src/news/newsCountries";
import {
  createNewsSnapshot,
  normalizeGNewsCountryResponse
} from "../../src/news/newsNormalizer";
import { refreshNewsSnapshot } from "../../src/news/newsRefreshService";
import { createNewsClient } from "../../src/news/newsClient";
import {
  isNewsApiResponse,
  isNewsSnapshot,
  NewsServiceError,
  type NewsSnapshot
} from "../../src/news/newsTypes";

const nowIso = "2026-05-21T00:00:00.000Z";

function gnewsPayload(overrides: Record<string, unknown> = {}) {
  return {
    articles: [
      {
        title: "  Headline  ",
        description: "  Summary  ",
        url: "https://example.com/story",
        image: "https://example.com/image.jpg",
        publishedAt: "2026-05-20T22:00:00Z",
        source: { name: " Example News " },
        ...overrides
      }
    ]
  };
}

function snapshot(): NewsSnapshot {
  return createNewsSnapshot({
    lastUpdated: nowIso,
    countries: [
      normalizeGNewsCountryResponse({
        countryCode: "us",
        countryName: "United States",
        payload: gnewsPayload(),
        nowIso
      })
    ]
  });
}

describe("news domain and normalization", () => {
  it("normalizes GNews payloads with provider image URLs and without article body fields", () => {
    const country = normalizeGNewsCountryResponse({
      countryCode: "US",
      countryName: "United States",
      payload: gnewsPayload(),
      nowIso
    });

    expect(country).toMatchObject({
      countryCode: "us",
      countryName: "United States",
      headlineCount: 1
    });
    expect(country.articles[0]).toEqual({
      id: expect.stringMatching(/^us-/),
      title: "Headline",
      summary: "Summary",
      url: "https://example.com/story",
      imageUrl: "https://example.com/image.jpg",
      sourceName: "Example News",
      publishedAt: "2026-05-20T22:00:00.000Z"
    });
    expect(country.articles[0]).not.toHaveProperty("image");
    expect(country.articles[0]).not.toHaveProperty("content");
  });

  it("drops invalid articles and accepts empty country responses", () => {
    const country = normalizeGNewsCountryResponse({
      countryCode: "jp",
      countryName: "Japan",
      payload: {
        articles: [
          { title: "", url: "https://example.com/empty" },
          { title: "Missing URL" },
          { title: "Valid", url: "https://example.com/valid" }
        ]
      },
      nowIso
    });
    const empty = normalizeGNewsCountryResponse({
      countryCode: "fr",
      countryName: "France",
      payload: { articles: [] },
      nowIso
    });

    expect(country.headlineCount).toBe(1);
    expect(country.articles[0].title).toBe("Valid");
    expect(empty).toMatchObject({ headlineCount: 0, articles: [] });
  });

  it("rejects invalid provider payloads and validates snapshots", () => {
    expect(() =>
      normalizeGNewsCountryResponse({
        countryCode: "us",
        countryName: "United States",
        payload: { notArticles: [] },
        nowIso
      })
    ).toThrow(NewsServiceError);

    expect(isNewsSnapshot(snapshot())).toBe(true);
    expect(isNewsApiResponse({ status: "ready", snapshot: snapshot(), stale: false })).toBe(
      true
    );
    expect(isNewsApiResponse({ status: "ready", snapshot: {}, stale: false })).toBe(
      false
    );
  });
});

describe("GNews provider", () => {
  it("builds top-headline requests and maps errors without leaking the key", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ articles: [] })
    });
    const provider = createGNewsProvider({
      apiKey: "secret-key",
      fetcher: fetcher as unknown as typeof fetch
    });

    await provider.fetchTopHeadlines({
      countryCode: "us",
      category: "general",
      language: "en",
      max: 10
    });

    const url = new URL(fetcher.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe("https://gnews.io/api/v4/top-headlines");
    expect(url.searchParams.get("country")).toBe("us");
    expect(url.searchParams.get("category")).toBe("general");
    expect(url.searchParams.get("lang")).toBe("en");
    expect(url.searchParams.get("max")).toBe("10");
    expect(url.searchParams.get("apikey")).toBe("secret-key");

    const quotaProvider = createGNewsProvider({
      apiKey: "secret-key",
      fetcher: vi.fn().mockResolvedValue({ ok: false, status: 429 }) as unknown as typeof fetch
    });
    await expect(
      quotaProvider.fetchTopHeadlines({
        countryCode: "us",
        category: "general",
        language: "en",
        max: 10
      })
    ).rejects.toMatchObject({ reason: "quota-exceeded" });
  });
});

describe("news cache and refresh", () => {
  it("uses memory cache hits, misses, locks, and stale preservation", async () => {
    const cache = createMemoryNewsCacheRepository();

    expect(await cache.getSnapshot()).toBeUndefined();
    expect(await cache.acquireRefreshLock(nowIso)).toBe(true);
    expect(await cache.acquireRefreshLock(nowIso)).toBe(false);
    await cache.releaseRefreshLock();

    const record = { snapshot: snapshot(), refreshedAt: nowIso };
    await cache.setSnapshot(record);
    expect(await cache.getSnapshot()).toEqual(record);
  });

  it("refreshes countries, stops on quota, and preserves prior cache on failure", async () => {
    const cache = createMemoryNewsCacheRepository();
    const provider = {
      fetchTopHeadlines: vi.fn().mockResolvedValue(gnewsPayload())
    };

    const result = await refreshNewsSnapshot({
      provider,
      cache,
      countries: listNewsCountries().slice(0, 2),
      now: () => new Date(nowIso)
    });

    expect(result).toMatchObject({ status: "refreshed", countryCount: 2 });
    expect(provider.fetchTopHeadlines).toHaveBeenCalledTimes(2);
    expect(await cache.getSnapshot()).toMatchObject({
      refreshedAt: nowIso
    });

    const quotaProvider = {
      fetchTopHeadlines: vi.fn().mockRejectedValue(
        new NewsServiceError("quota-exceeded", "quota")
      )
    };
    const failed = await refreshNewsSnapshot({
      provider: quotaProvider,
      cache,
      countries: listNewsCountries().slice(0, 2),
      now: () => new Date("2026-05-22T00:00:00.000Z")
    });

    expect(failed).toMatchObject({ status: "failed", reason: "quota-exceeded" });
    expect((await cache.getSnapshot())?.refreshedAt).toBe(nowIso);
  });
});

describe("news API and client", () => {
  it("returns unavailable without KV and reads cached snapshots without provider calls", async () => {
    await expect(getNewsApiResponse({}, () => new Date(nowIso))).resolves.toEqual({
      status: "unavailable",
      reason: "cache-empty",
      message: "News has not loaded yet."
    });

    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        result: { snapshot: snapshot(), refreshedAt: nowIso }
      })
    });
    const ready = await getNewsApiResponse(
      {
        KV_REST_API_URL: "https://kv.example",
        KV_REST_API_TOKEN: "kv-token"
      },
      () => new Date("2026-05-21T01:00:00.000Z"),
      fetcher as unknown as typeof fetch
    );

    expect(ready).toMatchObject({ status: "ready", stale: false });
    expect(fetcher.mock.calls[0][0]).toContain("/get/");
  });

  it("protects refresh on missing keys and parses client responses", async () => {
    await expect(refreshNewsApi({}, vi.fn() as unknown as typeof fetch)).resolves.toEqual({
      status: "failed",
      reason: "missing-api-key",
      message: "News needs GNEWS_API_KEY on the server."
    });

    const response = { status: "ready" as const, snapshot: snapshot(), stale: false };
    const client = createNewsClient(
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(response)
      }) as unknown as typeof fetch
    );

    await expect(client.loadSnapshot()).resolves.toEqual(response);

    const brokenClient = createNewsClient(
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ status: "bad" })
      }) as unknown as typeof fetch
    );

    await expect(brokenClient.loadSnapshot()).resolves.toMatchObject({
      status: "unavailable",
      reason: "provider-failed"
    });
  });

  it("creates a Vercel KV repository with injected REST fetcher", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ result: undefined })
    });
    const repository = createVercelKvNewsCacheRepository({
      restApiUrl: "https://kv.example/",
      restApiToken: "kv-token",
      fetcher: fetcher as unknown as typeof fetch
    });

    await repository.getSnapshot();

    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("https://kv.example/get/"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer kv-token"
        })
      })
    );
  });
});
