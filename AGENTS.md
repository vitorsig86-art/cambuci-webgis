# Repository Guidelines

This is the Antonio C. Martelletto WebGIS in Cambuci - Rio de Janeiro: React, TypeScript, Vite and CesiumJS. The source cardeal-map-template is read-only; modify only this independent project.

## Template origin

Cloned from cardeal-map-template v2.0.0 (commit `9144d32`, 2026-10-04). Since then, ported by hand: part of the v3 interface (theme, fonts, icons, header, "Sobre os dados", mobile bottom bar; commit `02c9981`) and `panel.mobileStartOpen` (template `7e32817`); popup actions with `EmbeddedPageOverlay` and `embeddedPages.allowedOrigins` (template `1911ad2`), and from `3df9cae` only `flyTo`/`onClose`, `captureCamera`/`restoreCamera` and `defaultVisibleMobile` (not `panelOrder`, `openOnHome` or the checks). When bringing more template changes, read the template CHANGELOG from v2.0.0 and skip what is listed here.

## Structure

- src/projects/: property-specific configuration, source URLs, bounds, zoom levels, labels, legends and opening/Home camera. cambuci.ts is the editable entry point.
- src/cesium/: reusable viewer, camera, loaders and measurement utilities.
- src/hooks/: viewer, layer and measurement lifecycle.
- src/components/: reusable Portuguese UI and responsive CSS.
- public/legends/: image legend assets; example.png is illustrative.
- scripts/: local generic regression checks.
- agent/skills/, .agents/skills/, .claude/skills/: existing Cesium contributor guides; preserve reference files and junctions.

## Validation

Use npm.cmd on PowerShell if npm.ps1 is blocked. Run npm ci, npm run typecheck, npm run check and npm run build. Verify affected interactions in desktop/mobile browser and preview. Tests use synthetic data; validate remote URLs/CORS with the final project configuration.

Use two-space indentation, double-quoted imports, semicolons, PascalCase components, camelCase functions and use-prefixed hooks. Keep generic components independent of layer IDs/themes. Legends require PNG plus config only. Preserve the approved desktop layout and mobile drawer/backdrop/sticky header, compact cards/controls, tap-expand legends and native Cesium attribution.

Do not place real property-specific defaults in the template. Configure exampleLayers before adding entries to the active layers list: invisible rasters/vectors are still loaded. Keep credentials out of commits; VITE_* values are browser visible. Never copy .env.local. Do not commit node_modules, dist, caches or verification artifacts. Do not initialize Git, push or rewrite history unless requested; if this template already has Git, review the diff before committing.
