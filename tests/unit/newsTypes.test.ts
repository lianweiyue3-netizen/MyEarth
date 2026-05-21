import { describe, expect, it } from "vitest";
import {
  isNewsApiResponse,
  isNewsState,
  isSerializableNewsState,
  type NewsApiResponse,
  type NewsSnapshot,
  type NewsState
} from "../../src/news/newsTypes";

const snapshot: NewsSnapshot = {
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
          title: "Test headline",
          summary: "Short provider summary",
          url: "https://example.com/news",
          imageUrl: "https://example.com/news.jpg",
          sourceName: "Example News",
          publishedAt: "2026-05-21T00:00:00.000Z"
        }
      ]
    }
  }
};

describe("news domain types", () => {
  it("accepts ready API responses", () => {
    const response: NewsApiResponse = {
      status: "ready",
      snapshot,
      stale: false
    };

    expect(isNewsApiResponse(response)).toBe(true);
  });

  it("accepts unavailable API responses", () => {
    const response: NewsApiResponse = {
      status: "unavailable",
      reason: "rate-limited",
      message: "News is temporarily rate-limited by GNews. Try again shortly."
    };

    expect(isNewsApiResponse(response)).toBe(true);
  });

  it("rejects malformed API responses", () => {
    expect(
      isNewsApiResponse({
        status: "ready",
        snapshot: {
          ...snapshot,
          lastUpdated: "not-a-date"
        },
        stale: false
      })
    ).toBe(false);

    expect(
      isNewsApiResponse({
        status: "unavailable",
        reason: "secret-provider-error",
        message: "nope"
      })
    ).toBe(false);
  });

  it("keeps news state serializable", () => {
    const state: NewsState = {
      status: "ready",
      snapshot,
      selectedCountryCode: "us"
    };

    expect(isNewsState(state)).toBe(true);
    expect(isSerializableNewsState(state)).toBe(true);
  });

  it("models optional article image URLs but not article body fields", () => {
    const article = snapshot.countries.us.articles[0];

    expect(article.imageUrl).toBe("https://example.com/news.jpg");
    expect("image" in article).toBe(false);
    expect("body" in article).toBe(false);
    expect("content" in article).toBe(false);
  });
});
