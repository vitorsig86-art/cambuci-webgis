import type { PanelSubheadingConfig, ProjectConfig, ProjectLayerConfig } from "../projects/types";
import type { ReactNode } from "react";
import "./LayerPanel.css";

interface Props {
  project: ProjectConfig;
  visible: Set<string>;
  rasterOpacities: Record<string, number>;
  onOpacityChange: (id: string, percent: number) => void;
  onToggle: (id: string) => void;
  onClose: () => void;
  onCollapse?: () => void;
  sheetHigh?: boolean;
  onToggleSheetHeight?: () => void;
  children?: ReactNode;
}

export function getWorkspaceSections(layers: ProjectLayerConfig[]) {
  return [
    { id: "basemap", title: "Mapa base", layers: layers.filter((layer) => layer.kind === "basemap") },
    { id: "model", title: "Modelo 3D", layers: layers.filter((layer) => layer.source.format === "3d-tiles") },
    { id: "raster", title: "Rasters", layers: layers.filter((layer) => layer.kind !== "basemap" && layer.group !== "macro" && (layer.source.format === "tms" || layer.source.format === "xyz")) },
    { id: "vector", title: "Vetores", layers: layers.filter((layer) => layer.source.format === "geojson" && layer.group !== "macro") },
    { id: "macro", title: "Análise Macro", layers: layers.filter((layer) => layer.group === "macro") },
  ].filter((section) => section.id !== "macro" || section.layers.length > 0);
}

type PanelItem =
  | { type: "sectionLabel"; title: string }
  | { type: "layer"; layer: ProjectLayerConfig };

function getPanelItems(layers: ProjectLayerConfig[], subheadings: PanelSubheadingConfig[] = []): PanelItem[] {
  const remaining = new Map(layers.map((layer) => [layer.id, layer]));
  const items: PanelItem[] = [];
  for (const subheading of subheadings) {
    const entries: PanelItem[] = [];
    for (const id of subheading.layerIds) {
      const layer = remaining.get(id);
      if (!layer) continue;
      entries.push({ type: "layer", layer });
      remaining.delete(id);
    }
    if (entries.length > 0) items.push({ type: "sectionLabel", title: subheading.title }, ...entries);
  }
  // Keep unlisted layers visible in the panel for future additions.
  for (const layer of remaining.values()) items.push({ type: "layer", layer });
  return items;
}

export function LayerPanel({ project, visible, rasterOpacities, onOpacityChange, onToggle, onClose, onCollapse, sheetHigh, onToggleSheetHeight, children }: Props) {
  return (
    <>
      {onToggleSheetHeight && <button type="button" className="sheet-handle" onClick={onToggleSheetHeight} aria-label={sheetHigh ? "Reduzir painel de camadas" : "Ampliar painel de camadas"}><span aria-hidden="true" /></button>}
      <div className="panel-heading workspace-project">
        <div>
          <h2>Camadas</h2>
          <p className="workspace-context">{project.name} — {project.location}</p>
        </div>
        {onCollapse && <button type="button" className="panel-icon-button desktop-only" onClick={onCollapse} aria-label="Recolher painel de camadas">‹</button>}
        <button type="button" className="panel-icon-button mobile-only" onClick={onClose} aria-label="Fechar painel de camadas">×</button>
      </div>
      {children}
      {getWorkspaceSections(project.layers).map((section) => (
        <details key={section.id} className="workspace-section" open>
          <summary className="workspace-section-toggle">
            <span className="workspace-section-title">{section.title}</span>
            <span className="workspace-section-count">{section.layers.filter(layer => visible.has(layer.id)).length}/{section.layers.length}</span>
            <span className="workspace-section-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="layer-list">
            {getPanelItems(section.layers, project.panelSubheadings?.[section.id]).map((item, index) => {
              if (item.type === "sectionLabel") {
                return <h4 key={`subheading-${index}`} className="layer-subheading">{item.title}</h4>;
              }
              const layer = item.layer;
              const enabled = visible.has(layer.id);
              const opacity = rasterOpacities[layer.id] ?? 100;
              const isModel = section.id === "model";
              return (
                <div key={layer.id} className={`layer-card ${enabled ? "is-active" : ""} ${isModel ? "model-layer-card" : ""}`}>
                  <label className="layer-toggle">
                    {isModel && <span className="model-layer-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinejoin="round">
                        <path d="m12 2 9 5v10l-9 5-9-5V7Z M3 7l9 5 9-5 M12 12v10" />
                      </svg>
                    </span>}
                    <span className="layer-copy">
                      <strong>{layer.name}</strong>
                      {isModel && <small>Visualização tridimensional</small>}
                    </span>
                    <input className="layer-switch" type="checkbox" checked={enabled} onChange={() => onToggle(layer.id)} />
                  </label>
                  {(section.id === "raster" || layer.opacityControl) && enabled && <div className="layer-opacity">
                    <div className="layer-opacity-heading">
                      <label htmlFor={`opacity-${layer.id}`}>Opacidade</label>
                      <output htmlFor={`opacity-${layer.id}`}>{opacity}%</output>
                    </div>
                    <input
                      id={`opacity-${layer.id}`}
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={opacity}
                      aria-label={`Opacidade de ${layer.name}`}
                      aria-valuetext={`${opacity}%`}
                      onChange={(event) => onOpacityChange(layer.id, Number(event.currentTarget.value))}
                    />
                  </div>}
                </div>
              );
            })}
          </div>
        </details>
      ))}
    </>
  );
}
