import React from "react";
import {
  act,
  cleanup,
  render,
  renderHook,
  screen
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  iconOnlyButtonName,
  moveFocusToPanel,
  togglePressedState
} from "../../src/accessibility/focusManagement";
import { announceStatus } from "../../src/accessibility/liveRegion";
import { useReducedMotion } from "../../src/accessibility/reducedMotion";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const originalMatchMedia = window.matchMedia;

type MediaChangeListener = (event: MediaQueryListEvent) => void;

function installMatchMedia(matches: boolean) {
  let currentMatches = matches;
  const listeners = new Set<MediaChangeListener>();

  const mediaQueryList = {
    get matches() {
      return currentMatches;
    },
    media: REDUCED_MOTION_QUERY,
    onchange: null,
    addEventListener: vi.fn(
      (eventName: string, listener: MediaChangeListener) => {
        if (eventName === "change") {
          listeners.add(listener);
        }
      }
    ),
    removeEventListener: vi.fn(
      (eventName: string, listener: MediaChangeListener) => {
        if (eventName === "change") {
          listeners.delete(listener);
        }
      }
    ),
    addListener: vi.fn((listener: MediaChangeListener) => {
      listeners.add(listener);
    }),
    removeListener: vi.fn((listener: MediaChangeListener) => {
      listeners.delete(listener);
    }),
    dispatchEvent: vi.fn(() => true)
  } as unknown as MediaQueryList;

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue(mediaQueryList)
  });

  return {
    mediaQueryList,
    setMatches(nextMatches: boolean) {
      currentMatches = nextMatches;
      const event = {
        matches: nextMatches,
        media: REDUCED_MOTION_QUERY
      } as MediaQueryListEvent;

      listeners.forEach((listener) => listener(event));
    }
  };
}

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: originalMatchMedia
  });
  vi.clearAllMocks();
});

describe("useReducedMotion", () => {
  it("returns true when the reduced-motion media query matches", () => {
    installMatchMedia(true);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
  });

  it("returns false when the reduced-motion media query does not match", () => {
    installMatchMedia(false);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it("responds to reduced-motion media query changes", () => {
    const media = installMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());

    act(() => {
      media.setMatches(true);
    });

    expect(result.current).toBe(true);
    expect(media.mediaQueryList.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("defaults to false when the media query API is unavailable", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined
    });

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });
});

describe("announceStatus", () => {
  it("creates a polite live region and updates its message", () => {
    announceStatus("Weather radar failed to load.");

    const region = document.getElementById("myearth-live-region");

    expect(region).toHaveAttribute("role", "status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
    expect(region).toHaveTextContent("Weather radar failed to load.");
  });
});

describe("moveFocusToPanel", () => {
  it("moves focus to an existing panel target", () => {
    const before = document.createElement("button");
    before.type = "button";
    before.textContent = "Before";
    const panel = document.createElement("section");
    panel.id = "learning-panel";

    document.body.append(before, panel);
    before.focus();

    moveFocusToPanel("learning-panel");

    expect(document.activeElement).toBe(panel);
    expect(panel).toHaveAttribute("tabindex", "-1");
  });

  it("leaves focus unchanged and announces status when the target is missing", () => {
    const before = document.createElement("button");
    before.type = "button";
    before.textContent = "Before";
    document.body.append(before);
    before.focus();

    moveFocusToPanel("missing-panel");

    expect(document.activeElement).toBe(before);
    expect(document.getElementById("myearth-live-region")).toHaveTextContent(
      "Panel missing-panel is unavailable."
    );
  });
});

describe("accessible control patterns", () => {
  it("allows icon-only controls to be reached by accessible name", () => {
    render(
      React.createElement(
        "button",
        { "aria-label": "Reset view", type: "button" },
        React.createElement("span", { "aria-hidden": true }, "R")
      )
    );

    expect(screen.getByRole("button", { name: "Reset view" })).toBeEnabled();
  });

  it("provides reusable props for icon-only and toggle controls", () => {
    expect(iconOnlyButtonName("Reset view")).toEqual({
      "aria-label": "Reset view"
    });
    expect(togglePressedState(true)).toEqual({ "aria-pressed": true });
  });
});
