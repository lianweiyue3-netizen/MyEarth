import { expect, test } from "@playwright/test";

test("boots into Cesium fallback when token is absent", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("missing-token-fallback")).toBeVisible();
  await expect(page.getByTestId("command-overlay")).toBeVisible();
  await expect(page.getByText("VITE_CESIUM_ION_TOKEN")).toBeVisible();
});

test("wonder tour advances through all required wonders", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("heading", { name: "Mount Everest" })).toBeVisible();

  const expected = [
    "Grand Canyon",
    "Amazon Rainforest",
    "Great Barrier Reef",
    "Sahara Desert",
    "Antarctica",
    "Himalayas",
    "Aurora Region"
  ];

  for (const name of expected) {
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
});

test("layer toggles update visible state and attribution", async ({ page }) => {
  await page.goto("/");

  const radar = page.getByRole("button", { name: "Radar" });
  await expect(radar).toHaveAttribute("aria-pressed", "false");
  await radar.click();
  await expect(radar).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("contentinfo", { name: "Map attribution" })).toContainText(
    "RainViewer"
  );
});

test("sound does not start before opt-in", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Sound notPrompted")).toBeVisible();
  await page.getByRole("button", { name: "Sound On" }).click();
  await expect(page.getByText(/Sound enabled|Sound unavailable|Sound disabled/)).toBeVisible();
});

test("controls and attribution are visible in viewport", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "MyEarth" })).toBeVisible();
  await expect(page.getByRole("contentinfo", { name: "Map attribution" })).toBeVisible();
  await expect(page.getByLabel("Search Earth")).toBeVisible();
});
