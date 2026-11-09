// Mobile start state. The map starts clear (sheet closed) until the user taps
// "Camadas"; startOpen = true (panel.mobileStartOpen) opens the sheet instead.
// Ported from cardeal-map-template; this project has no temporal campaigns
// or popup.openOnHome, so only startOpen is needed.
export function initialMobileState(startOpen = false): { panelOpen: boolean } {
  return { panelOpen: startOpen };
}

// Mobile layout breakpoint (same as the CSS). Ported from cardeal-map-template 3.1.0.
export const MOBILE_MEDIA_QUERY = "(max-width: 760px)";

export function isMobileLayout(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}
