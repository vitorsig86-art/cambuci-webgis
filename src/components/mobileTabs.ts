// Mobile start state. The map starts clear (sheet closed) until the user taps
// "Camadas"; startOpen = true (panel.mobileStartOpen) opens the sheet instead.
// Ported from cardeal-map-template; this project has no temporal campaigns
// or popup.openOnHome, so only startOpen is needed.
export function initialMobileState(startOpen = false): { panelOpen: boolean } {
  return { panelOpen: startOpen };
}
