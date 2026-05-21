import { describe, expect, it, vi } from "vitest";
import { createNewsClient } from "../../src/news/newsClient";
import type { NewsApiResponse } from "../../src/news/newsTypes";

const readyResponse: NewsApiResponse = {
  status: "ready",
  stale: false,
  snapshot: {
    provider: "GNews",
    category: "general",
    language: "en",
    lastUpdated: "2026-05-21T00:00:00.000Z",
    countries: {
      us: {
        countryCode: "us",
        countryName: "United States",
        headlineCount: 1,
        articles: [
          {
            id: "us-0-test",
            title: "Headline",
            summary: "Summary",
            url: "https://example.com/story",
            sourceName: "Example News",
            publishedAt: "2026-05-21T00:00:00.000Z"
          }
        ]
      }
    }
  }
};

describe("news client", () => {
  it("fetches the news endpoint and parses ready responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(readyResponse)
    });
    const client = createNewsClient(fetcher as unknown as typeof fetch);

    await expect(client.loadSnapshot()).resolves.toEqual(readyResponse);
    expect(fetcher).toHaveBeenCalledWith(
      "/api/news",
      expect.objectContaining({
        headers: { Accept: "application/json" }
      })
    );
  });

  it("parses unavailable responses", async () => {
    const response: NewsApiResponse = {
      status: "unavailable",
      reason: "cache-empty",
      message: "News has not loaded yet."
    };
    const client = createNewsClient(
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(response)
      }) as unknown as typeof fetch
    );

    await expect(client.loadSnapshot()).resolves.toEqual(response);
  });

  it("converts malformed and failed HTTP responses to unavailable", async () => {
    const malformedClient = createNewsClient(
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ status: "ready", snapshot: {} })
      }) as unknown as typeof fetch
    );
    const failedHttpClient = createNewsClient(
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: vi.fn()
      }) as unknown as typeof fetch
    );

    await expect(malformedClient.loadSnapshot()).resolves.toMatchObject({
      status: "unavailable",
      reason: "provider-failed"
    });
    await expect(failedHttpClient.loadSnapshot()).resolves.toMatchObject({
      status: "unavailable",
      reason: "provider-failed"
    });
  });

  it("converts network failures but rethrows aborts", async () => {
    const failedClient = createNewsClient(
      vi.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch
    );
    await expect(failedClient.loadSnapshot()).resolves.toMatchObject({
      status: "unavailable",
      reason: "provider-failed"
    });

    const abort = new DOMException("Aborted", "AbortError");
    const abortedClient = createNewsClient(
      vi.fn().mockRejectedValue(abort) as unknown as typeof fetch
    );
    await expect(abortedClient.loadSnapshot()).rejects.toBe(abort);
  });
});
