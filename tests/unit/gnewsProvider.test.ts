import { describe, expect, it, vi } from "vitest";
import {
  buildGNewsTopHeadlinesUrl,
  createGNewsProvider
} from "../../src/news/gnewsProvider";

const request = {
  countryCode: "us",
  category: "general",
  language: "en",
  max: 10
} as const;

describe("GNews provider adapter", () => {
  it("constructs the required top-headlines URL", () => {
    const url = new URL(buildGNewsTopHeadlinesUrl("secret-key", request));

    expect(url.origin + url.pathname).toBe("https://gnews.io/api/v4/top-headlines");
    expect(url.searchParams.get("country")).toBe("us");
    expect(url.searchParams.get("category")).toBe("general");
    expect(url.searchParams.get("lang")).toBe("en");
    expect(url.searchParams.get("max")).toBe("10");
    expect(url.searchParams.get("apikey")).toBe("secret-key");
  });

  it("constructs Japanese top-headlines URLs for Japan", () => {
    const url = new URL(
      buildGNewsTopHeadlinesUrl("secret-key", {
        countryCode: "jp",
        category: "general",
        language: "ja",
        max: 10
      })
    );

    expect(url.searchParams.get("country")).toBe("jp");
    expect(url.searchParams.get("lang")).toBe("ja");
  });

  it("fetches one country response with an injected fetcher", async () => {
    let requestedUrl: string | undefined;
    const fetcher = vi.fn(async (input) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({ articles: [] }), { status: 200 });
    }) as unknown as typeof fetch;
    const provider = createGNewsProvider({ apiKey: "secret-key", fetcher });

    await expect(provider.fetchTopHeadlines(request)).resolves.toEqual({
      articles: []
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(requestedUrl).toContain("country=us");
    expect(requestedUrl).toContain("category=general");
    expect(requestedUrl).toContain("lang=en");
    expect(requestedUrl).toContain("max=10");
  });

  it("maps 401 and 403 to provider failures without leaking the key", async () => {
    const secret = "secret-key-that-must-not-leak";

    for (const status of [401, 403]) {
      const provider = createGNewsProvider({
        apiKey: secret,
        fetcher: vi.fn(async () => new Response("{}", { status })) as unknown as typeof fetch
      });

      await provider.fetchTopHeadlines(request).catch((error: unknown) => {
        expect(error).toMatchObject({ reason: "provider-failed" });
        expect(String(error)).not.toContain(secret);
      });
    }
  });

  it("maps 429 daily quota responses to quota exceeded", async () => {
    const provider = createGNewsProvider({
      apiKey: "secret-key",
      fetcher: vi.fn(
        async () =>
          new Response(
            JSON.stringify({ errors: ["Daily request limit exceeded."] }),
            { status: 429 }
          )
      ) as unknown as typeof fetch
    });

    await expect(provider.fetchTopHeadlines(request)).rejects.toMatchObject({
      reason: "quota-exceeded"
    });
  });

  it("maps 429 burst throttle responses to rate limited", async () => {
    const provider = createGNewsProvider({
      apiKey: "secret-key",
      fetcher: vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              errors:
                "This request was blocked because you made too many requests on the API in a short period of time."
            }),
            { status: 429 }
          )
      ) as unknown as typeof fetch
    });

    await expect(provider.fetchTopHeadlines(request)).rejects.toMatchObject({
      reason: "rate-limited"
    });
  });

  it("maps invalid JSON to invalid provider payload", async () => {
    const provider = createGNewsProvider({
      apiKey: "secret-key",
      fetcher: vi.fn(async () => new Response("not json", { status: 200 })) as unknown as typeof fetch
    });

    await expect(provider.fetchTopHeadlines(request)).rejects.toMatchObject({
      reason: "invalid-provider-payload"
    });
  });

  it("aborts timed-out requests", async () => {
    const fetcher = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        })
    ) as unknown as typeof fetch;
    const provider = createGNewsProvider({
      apiKey: "secret-key",
      fetcher,
      timeoutMs: 1
    });

    await expect(provider.fetchTopHeadlines(request)).rejects.toMatchObject({
      reason: "provider-failed"
    });
  });

  it("detects a missing API key before calling fetch", async () => {
    const fetcher = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const provider = createGNewsProvider({ apiKey: " ", fetcher });

    await expect(provider.fetchTopHeadlines(request)).rejects.toMatchObject({
      reason: "missing-api-key"
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
