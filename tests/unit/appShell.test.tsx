import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  window.localStorage.clear();
});

describe("App shell", () => {
  it("shows loading before first frame and safe missing-token guidance", async () => {
    vi.stubEnv("VITE_CESIUM_ION_TOKEN", "");
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));

    render(<App />);

    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
    await expect(screen.findByTestId("missing-token-fallback")).resolves.toBeVisible();
    expect(screen.getAllByText(/VITE_CESIUM_ION_TOKEN/).length).toBeGreaterThan(0);
  });

  it("shows the command overlay after the first frame", async () => {
    vi.stubEnv("VITE_CESIUM_ION_TOKEN", "");
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    render(<App />);

    await waitFor(() =>
      expect(screen.getByTestId("command-overlay").className).toMatch(/ready/)
    );
    expect(screen.getByRole("button", { name: "Reset View" })).toBeEnabled();
  });
});
