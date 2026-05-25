import { describe, expect, it, vi } from "vitest";
import {
  getCachedNewsApiResponse,
  handleNewsApiRequest,
  type ApiResponseLike
} from "../../api/news";
import {
  getRefreshNewsApiResponse,
  handleNewsRefreshApiRequest,
  type RefreshApiResponseLike
} from "../../api/news/refresh";
import {
  getYouTubeVideoApiResponse,
  handleYouTubeVideoApiRequest,
  type VideoApiResponseLike
} from "../../api/news/video";
import {
  createNewsCacheRepository,
  type NewsKvJsonClient,
  type NewsKvSetOptions
} from "../../src/news/newsCache";
import type { GNewsProvider } from "../../src/news/gnewsProvider";
import type { NewsCountryDefinition } from "../../src/news/newsCountries";
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

const countries: readonly NewsCountryDefinition[] = [
  {
    code: "us",
    name: "United States",
    centroid: { latitude: 39, longitude: -98 },
    cameraHeightMeters: 5_000_000
  }
];

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

describe("news API handlers", () => {
  it("returns cached ready responses from /api/news", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    await cache.setSnapshot({ snapshot, refreshedAt: snapshot.lastUpdated });

    await expect(
      getCachedNewsApiResponse({
        cache,
        now: () => new Date("2026-05-21T12:00:00.000Z")
      })
    ).resolves.toEqual({
      status: "ready",
      snapshot,
      stale: false
    });
  });

  it("marks cached responses stale after 24 hours", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    await cache.setSnapshot({ snapshot, refreshedAt: snapshot.lastUpdated });

    await expect(
      getCachedNewsApiResponse({
        cache,
        now: () => new Date("2026-05-22T01:00:00.000Z")
      })
    ).resolves.toMatchObject({
      status: "ready",
      stale: true
    });
  });

  it("returns unavailable when the cache is empty or unconfigured", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());

    await expect(getCachedNewsApiResponse({ cache })).resolves.toEqual({
      status: "unavailable",
      reason: "cache-empty",
      message: "News has not loaded yet."
    });

    await expect(getCachedNewsApiResponse({ env: {} })).resolves.toEqual({
      status: "unavailable",
      reason: "cache-empty",
      message: "News cache is not configured."
    });
  });

  it("serves /api/news without exposing server secrets", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    const secret = "server-secret";
    await cache.setSnapshot({ snapshot, refreshedAt: snapshot.lastUpdated });
    const response = createResponseRecorder<ApiResponseLike>();

    await handleNewsApiRequest(
      { method: "GET" },
      response,
      {
        cache,
        env: { GNEWS_API_KEY: secret },
        now: () => new Date("2026-05-21T12:00:00.000Z")
      }
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain(secret);
  });

  it("refreshes news through the protected refresh endpoint", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    const provider: GNewsProvider = {
      fetchTopHeadlines: vi.fn(async () => ({ articles: [] }))
    };

    await expect(
      getRefreshNewsApiResponse({
        cache,
        provider,
        countries,
        env: { GNEWS_API_KEY: "server-secret" },
        now: () => new Date("2026-05-21T12:00:00.000Z")
      })
    ).resolves.toMatchObject({
      status: "refreshed",
      countryCount: 1
    });
    expect(provider.fetchTopHeadlines).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid refresh secrets before calling the provider", async () => {
    const cache = createNewsCacheRepository(new MemoryKvClient());
    const provider: GNewsProvider = {
      fetchTopHeadlines: vi.fn(async () => ({ articles: [] }))
    };
    const response = createResponseRecorder<RefreshApiResponseLike>();

    await handleNewsRefreshApiRequest(
      {
        method: "GET",
        headers: { "x-news-refresh-secret": "wrong-secret" }
      },
      response,
      {
        cache,
        provider,
        countries,
        env: {
          GNEWS_API_KEY: "server-secret",
          NEWS_REFRESH_SECRET: "expected-secret"
        }
      }
    );

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      status: "failed",
      reason: "provider-failed",
      message: "Unauthorized refresh request."
    });
    expect(provider.fetchTopHeadlines).not.toHaveBeenCalled();
  });

  it("reports missing key and missing KV without provider calls", async () => {
    const provider: GNewsProvider = {
      fetchTopHeadlines: vi.fn(async () => ({ articles: [] }))
    };

    await expect(
      getRefreshNewsApiResponse({
        cache: createNewsCacheRepository(new MemoryKvClient()),
        provider,
        countries,
        env: {}
      })
    ).resolves.toMatchObject({
      status: "failed",
      reason: "missing-api-key"
    });

    await expect(
      getRefreshNewsApiResponse({
        provider,
        countries,
        env: { GNEWS_API_KEY: "server-secret" }
      })
    ).resolves.toMatchObject({
      status: "failed",
      reason: "cache-empty"
    });
    expect(provider.fetchTopHeadlines).not.toHaveBeenCalled();
  });

  it("does not leak API key values through refresh failures", async () => {
    const secret = "secret-key-that-must-not-leak";
    const cache = createNewsCacheRepository(new MemoryKvClient());
    const provider: GNewsProvider = {
      fetchTopHeadlines: vi.fn(async () => {
        throw new Error(secret);
      })
    };

    const result = await getRefreshNewsApiResponse({
      cache,
      provider,
      countries,
      env: { GNEWS_API_KEY: secret },
      now: () => new Date("2026-05-21T12:00:00.000Z")
    });

    expect(result).toMatchObject({
      status: "failed",
      reason: "provider-failed"
    });
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it("looks up embeddable YouTube videos without leaking the key", async () => {
    const secret = "youtube-secret";
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return new Response(
        JSON.stringify({
          items: [
            {
              id: { videoId: "video123" },
              snippet: {
                title: "Related story video",
                channelTitle: "Example Channel",
                thumbnails: {
                  medium: { url: "https://example.com/thumb.jpg" }
                }
              }
            }
          ]
        }),
        { status: 200 }
      );
    });

    const result = await getYouTubeVideoApiResponse({
      env: { YOUTUBE_API_KEY: secret },
      fetcher: fetcher as unknown as typeof fetch,
      query: "test headline news"
    });

    expect(result).toEqual({
      status: "ready",
      video: {
        videoId: "video123",
        title: "Related story video",
        channelTitle: "Example Channel",
        thumbnailUrl: "https://example.com/thumb.jpg"
      }
    });
    const requestUrl = new URL(String(fetcher.mock.calls[0]?.[0]));
    expect(requestUrl.origin + requestUrl.pathname).toBe(
      "https://www.googleapis.com/youtube/v3/search"
    );
    expect(requestUrl.searchParams.get("q")).toBe("test headline news");
    expect(requestUrl.searchParams.get("videoEmbeddable")).toBe("true");
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it("handles missing YouTube setup and method checks safely", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return new Response("{}", { status: 200 });
    });

    await expect(
      getYouTubeVideoApiResponse({
        env: {},
        fetcher: fetcher as unknown as typeof fetch,
        query: "test headline news"
      })
    ).resolves.toEqual({
      status: "unavailable",
      reason: "missing-api-key",
      message: "YouTube video lookup needs YOUTUBE_API_KEY on the server."
    });
    expect(fetcher).not.toHaveBeenCalled();

    const response = createResponseRecorder<VideoApiResponseLike>();
    await handleYouTubeVideoApiRequest(
      { method: "POST", query: { query: "test headline news" } },
      response
    );

    expect(response.statusCode).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET");
    expect(response.body).toEqual({
      status: "unavailable",
      reason: "api-error",
      message: "Method not allowed."
    });
  });
});

function createResponseRecorder<
  T extends ApiResponseLike | RefreshApiResponseLike | VideoApiResponseLike
>() {
  const recorder = {
    statusCode: 200,
    headers: new Map<string, string>(),
    body: undefined as unknown,
    status(code: number) {
      recorder.statusCode = code;
      return recorder as unknown as T;
    },
    setHeader(name: string, value: string) {
      recorder.headers.set(name, value);
    },
    json(body: unknown) {
      recorder.body = body;
    }
  };

  return recorder;
}
