import { describe, expect, it } from "vitest";
import {
  createNewsSnapshot,
  normalizeGNewsCountryResponse
} from "../../src/news/newsNormalizer";
import { NewsServiceError } from "../../src/news/newsTypes";

const nowIso = "2026-05-21T10:00:00.000Z";

describe("news normalizer", () => {
  it("normalizes valid GNews country responses", () => {
    const summary = normalizeGNewsCountryResponse({
      countryCode: "US",
      countryName: " United States ",
      nowIso,
      payload: {
        totalArticles: 1,
        articles: [
          {
            title: "  A headline  ",
            description: "  A short summary.  ",
            content: "A longer provider field that should not be needed.",
            url: " https://example.com/story ",
            image: "https://example.com/image.jpg",
            publishedAt: "2026-05-21T09:00:00Z",
            source: {
              name: " Example News ",
              url: "https://example.com"
            }
          }
        ]
      }
    });

    expect(summary).toEqual({
      countryCode: "us",
      countryName: "United States",
      headlineCount: 1,
      articles: [
        {
          id: expect.stringMatching(/^us-0-/),
          title: "A headline",
          summary: "A short summary.",
          url: "https://example.com/story",
          sourceName: "Example News",
          publishedAt: "2026-05-21T09:00:00.000Z"
        }
      ]
    });
    expect(summary.articles[0]).not.toHaveProperty("image");
    expect(summary.articles[0]).not.toHaveProperty("body");
  });

  it("drops articles without a title or URL", () => {
    const summary = normalizeGNewsCountryResponse({
      countryCode: "us",
      countryName: "United States",
      nowIso,
      payload: {
        articles: [
          {
            title: "",
            description: "Missing title",
            url: "https://example.com/missing-title",
            publishedAt: nowIso,
            source: { name: "Example" }
          },
          {
            title: "Missing URL",
            description: "Missing URL",
            publishedAt: nowIso,
            source: { name: "Example" }
          },
          {
            title: "Valid",
            description: "Valid summary",
            url: "https://example.com/valid",
            publishedAt: nowIso,
            source: { name: "Example" }
          }
        ]
      }
    });

    expect(summary.headlineCount).toBe(1);
    expect(summary.articles[0].title).toBe("Valid");
  });

  it("keeps at most 10 valid articles", () => {
    const payload = {
      articles: Array.from({ length: 12 }, (_, index) => ({
        title: `Headline ${index}`,
        description: `Summary ${index}`,
        url: `https://example.com/${index}`,
        publishedAt: nowIso,
        source: { name: "Example" }
      }))
    };

    const summary = normalizeGNewsCountryResponse({
      countryCode: "us",
      countryName: "United States",
      nowIso,
      payload
    });

    expect(summary.headlineCount).toBe(10);
    expect(summary.articles).toHaveLength(10);
    expect(summary.articles[9]?.title).toBe("Headline 9");
  });

  it("returns zero headlines for empty country responses", () => {
    const summary = normalizeGNewsCountryResponse({
      countryCode: "us",
      countryName: "United States",
      nowIso,
      payload: { totalArticles: 0, articles: [] }
    });

    expect(summary).toEqual({
      countryCode: "us",
      countryName: "United States",
      headlineCount: 0,
      articles: []
    });
  });

  it("throws on malformed roots, malformed country codes, or invalid timestamps", () => {
    expect(() =>
      normalizeGNewsCountryResponse({
        countryCode: "us",
        countryName: "United States",
        nowIso,
        payload: { totalArticles: 1 }
      })
    ).toThrow(NewsServiceError);

    expect(() =>
      normalizeGNewsCountryResponse({
        countryCode: "usa",
        countryName: "United States",
        nowIso,
        payload: { articles: [] }
      })
    ).toThrow(NewsServiceError);

    expect(() =>
      normalizeGNewsCountryResponse({
        countryCode: "us",
        countryName: "United States",
        nowIso: "today",
        payload: { articles: [] }
      })
    ).toThrow(NewsServiceError);
  });

  it("aggregates country summaries into a snapshot", () => {
    const us = normalizeGNewsCountryResponse({
      countryCode: "us",
      countryName: "United States",
      nowIso,
      payload: { articles: [] }
    });
    const gb = normalizeGNewsCountryResponse({
      countryCode: "gb",
      countryName: "United Kingdom",
      nowIso,
      payload: { articles: [] }
    });

    const snapshot = createNewsSnapshot({
      countries: [us, gb],
      lastUpdated: nowIso
    });

    expect(snapshot).toMatchObject({
      provider: "GNews",
      category: "general",
      language: "en",
      lastUpdated: nowIso
    });
    expect(Object.keys(snapshot.countries)).toEqual(["us", "gb"]);
  });
});
