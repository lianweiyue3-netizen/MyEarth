const LIVE_REGION_ID = "myearth-live-region";

function visuallyHide(element: HTMLElement): void {
  element.style.position = "absolute";
  element.style.width = "1px";
  element.style.height = "1px";
  element.style.margin = "-1px";
  element.style.padding = "0";
  element.style.border = "0";
  element.style.overflow = "hidden";
  element.style.clip = "rect(0 0 0 0)";
  element.style.whiteSpace = "nowrap";
}

function getLiveRegion(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  const existing = document.getElementById(LIVE_REGION_ID);

  if (existing instanceof HTMLElement) {
    return existing;
  }

  const region = document.createElement("div");
  region.id = LIVE_REGION_ID;
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "true");
  visuallyHide(region);
  (document.body ?? document.documentElement).append(region);

  return region;
}

export function announceStatus(message: string): void {
  const region = getLiveRegion();

  if (!region) {
    return;
  }

  region.textContent = message;
}
