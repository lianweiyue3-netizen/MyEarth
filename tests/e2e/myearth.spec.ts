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
