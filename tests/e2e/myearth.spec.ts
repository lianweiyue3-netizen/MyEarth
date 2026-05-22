import { expect, test } from "@playwright/test";

test("boots into live Cesium or the safe fallback", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("command-overlay")).toBeVisible();
  if (await page.getByTestId("missing-token-fallback").count()) {
    await expect(page.getByTestId("missing-token-fallback")).toBeVisible();
    await page.getByRole("button", { name: /^Search/ }).click();
    await expect(page.getByText("Search needs VITE_CESIUM_ION_TOKEN.")).toBeVisible();
  } else {
    await expect(page.locator("canvas").first()).toBeVisible();
  }
});

test("location shortcuts select wonders without tour controls", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Start" })).toHaveCount(0);
  await expect(page.getByText("Tour idle")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Mount Everest" })).toHaveCount(0);
  await page.getByRole("button", { name: /^Places/ }).click();
  await page.getByRole("button", { name: "Grand Canyon" }).click();
  await expect(page.getByRole("button", { name: "Grand Canyon" })).toHaveAttribute(
    "class",
    /selected/
  );
});

test("layer toggles update visible state and attribution", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Aurora", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Atmosphere" })).toHaveCount(0);
  await page.getByRole("button", { name: /^Layers/ }).click();
  const radar = page.getByRole("button", { name: "Radar" });
  await expect(radar).toHaveAttribute("aria-pressed", "false");
  await radar.click();
  await expect(radar).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("radar-status")).toContainText("Radar active");
  await expect(page.getByRole("contentinfo", { name: "Map attribution" })).toContainText(
    "RainViewer"
  );
  await radar.click();
  await expect(radar).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("radar-status")).toHaveCount(0);
  await expect(page.getByRole("contentinfo", { name: "Map attribution" })).not.toContainText(
    "RainViewer"
  );
});

test("sound does not start before opt-in", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Sound notPrompted")).toBeVisible();
  await page.getByRole("button", { name: "Sound On" }).click();
  await expect(
    page.getByText(/Music enabled|Sound unavailable|Sound disabled/)
  ).toBeVisible();
});

test("controls and attribution are visible in viewport", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "MyEarth" })).toBeVisible();
  await expect(page.getByText("Natural wonders command center")).toHaveCount(0);
  await expect(page.getByRole("contentinfo", { name: "Map attribution" })).toBeVisible();
  await expect(page.getByLabel("Search Earth")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Search/ })).toBeVisible();
  await page.getByRole("button", { name: /^Search/ }).click();
  await expect(page.getByLabel("Search Earth")).toBeVisible();
  await expect(page.getByRole("button", { name: "Measure", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Distance/ })).toBeVisible();
  await page.getByRole("button", { name: /^Distance/ }).click();
  await expect(page.getByRole("button", { name: "Measure", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Layers/ })).toBeVisible();
  await expect(page.getByText(/Quality:/)).toHaveCount(0);
});

test("news panel shows a non-fatal unavailable state without a key", async ({ page }) => {
  await page.route("**/api/news", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        status: "unavailable",
        reason: "missing-api-key",
        message: "News needs GNEWS_API_KEY on the server."
      })
    });
  });
  await page.goto("/");

  await expect(page.getByTestId("command-overlay")).toBeVisible();
  await page.getByRole("button", { name: /^News/ }).click();
  await expect(page.getByTestId("news-right-rail")).toBeVisible();
  await expect(page.getByTestId("news-collapsed-panel")).toHaveCount(0);
  await expect(page.getByTestId("news-panel")).toBeVisible();
  await expect(page.getByText("News needs GNEWS_API_KEY on the server.")).toBeVisible({
    timeout: 15_000
  });
  await page.getByRole("button", { name: /^Layers/ }).click();
  await expect(
    page.getByRole("region", { name: "Layer toggles" }).getByRole("button", {
      name: "News",
      exact: true
    })
  ).toHaveCount(0);
});

test("news panel displays cached headlines and source attribution", async ({ page }) => {
  test.slow();

  await page.route("**/api/news", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
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
                  title: "Test headline",
                  summary: "Short summary",
                  url: "https://example.com/story",
                  imageUrl: "https://example.com/image.jpg",
                  sourceName: "Example News",
                  publishedAt: "2026-05-21T01:30:00.000Z"
                }
              ]
            }
          }
        }
      })
    });
  });
  await page.route("**/api/news/video**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        status: "ready",
        video: {
          videoId: "video123",
          title: "Test headline video",
          channelTitle: "Example Channel"
        }
      })
    });
  });
  await page.route("https://www.youtube-nocookie.com/embed/**", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Stub YouTube embed</title>"
    });
  });
  await page.goto("/");

  await expect(page.getByTestId("command-overlay")).toBeVisible();
  await page.getByRole("button", { name: /^News/ }).click();
  await expect(page.getByTestId("news-right-rail")).toBeVisible();
  await expect(page.getByTestId("news-collapsed-panel")).toHaveCount(0);
  await expect(page.getByTestId("news-panel")).toBeVisible();
  const railBox = await page.getByTestId("news-right-rail").boundingBox();
  const viewport = page.viewportSize();
  if ((viewport?.width ?? 0) > 760) {
    expect(railBox?.x ?? 0).toBeGreaterThan((viewport?.width ?? 0) / 2);
  } else {
    expect(railBox?.width ?? 0).toBeLessThanOrEqual(viewport?.width ?? 0);
  }
  await expect(page.getByText(/Last updated/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Show Map" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Hide Map" })).toHaveCount(0);
  await expect(page.getByRole("contentinfo", { name: "Map attribution" })).toContainText(
    "GNews"
  );
  await expect(page.getByRole("button", { name: /United States/ })).toBeVisible();
  await page.getByRole("button", { name: /United States/ }).click();
  await expect(page.getByRole("heading", { name: "United States" })).toBeVisible();
  await expect(page.getByText("Short summary")).toBeVisible();
  await expect(page.getByRole("link", { name: /Read article: Test headline/ })).toHaveAttribute(
    "href",
    "https://example.com/story"
  );
  await page.getByRole("button", { name: "Show YouTube video" }).click();
  await expect(
    page.getByTitle("YouTube video: Test headline video")
  ).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/video123/);
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("button", { name: /United States/ })).toBeVisible();
});
