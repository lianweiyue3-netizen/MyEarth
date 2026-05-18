import { announceStatus } from "./liveRegion";

function isNaturallyFocusable(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();

  if (element.isContentEditable) {
    return true;
  }

  if (tagName === "a" || tagName === "area") {
    return element.hasAttribute("href");
  }

  return (
    tagName === "button" ||
    tagName === "input" ||
    tagName === "select" ||
    tagName === "textarea" ||
    tagName === "summary"
  );
}

export function moveFocusToPanel(panelId: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const target = document.getElementById(panelId);

  if (!(target instanceof HTMLElement)) {
    announceStatus(`Panel ${panelId} is unavailable.`);
    return;
  }

  if (!target.hasAttribute("tabindex") && !isNaturallyFocusable(target)) {
    target.setAttribute("tabindex", "-1");
  }

  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
}

export function iconOnlyButtonName(label: string): { "aria-label": string } {
  return { "aria-label": label.trim() || "Control" };
}

export function togglePressedState(pressed: boolean): { "aria-pressed": boolean } {
  return { "aria-pressed": pressed };
}
