import { lazy, Suspense, useEffect, useState } from "react";
import { projects } from "./projects";
import { LayerPanel } from "./components/LayerPanel";
import { Legend } from "./components/Legend";
import { NavigationControls } from "./components/NavigationControls";
import { MeasurementToolbar } from "./components/MeasurementToolbar";
import { VectorPopup } from "./components/VectorPopup";
import { Icon } from "./components/icons";
import { AboutDialog } from "./components/AboutDialog";

import { useCesiumViewer } from "./hooks/useCesiumViewer";
import { useProjectLayers } from "./hooks/useProjectLayers";
import type { ProjectConfig } from "./projects/types";

const ModelDevelopmentTools = import.meta.env.DEV ? lazy(() => import("./components/ModelDevelopmentTools")) : null;

function defaultVisibility(project: ProjectConfig) {
  return new Set(project.layers.filter((layer) => layer.defaultVisible).map((layer) => layer.id));
}

export function App() {
  const project = projects[0];
  const [visible, setVisible] = useState(() => defaultVisibility(projects[0]));
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [sheetHigh, setSheetHigh] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"measure" | "legend" | "none">("none");
  const { containerRef, viewer, error } = useCesiumViewer();
  const { mapWarning, rasterOpacities, setRasterOpacity, getModel } = useProjectLayers(viewer, project, visible);
  const legendLayers = project.layers.filter((layer) => layer.legend && visible.has(layer.id));

  useEffect(() => {
    function closePanel(event: KeyboardEvent) {
      if (event.key === "Escape") setPanelOpen(false);
    }
    window.addEventListener("keydown", closePanel);
    return () => window.removeEventListener("keydown", closePanel);
  }, []);

  function showMobileView(view: "measure" | "legend") {
    setPanelOpen(false);
    setMobileView(current => current === view ? "none" : view);
  }

  function toggleLayer(id: string) {
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="app-shell" data-panel={panelCollapsed ? "collapsed" : "expanded"} data-mobile-view={panelOpen ? "none" : mobileView}>
      <div ref={containerRef} className="map-container" aria-label="Mapa 3D interativo do projeto" />
      <header className="app-header">
        <a className="brand" href="/" aria-label="Página inicial do Cardeal Map Viewer">
          <img src="/logo-cardeal.png" alt="" />
          <strong className="brand-company">Cardeal Map</strong>
        </a>
        <span className="brand-project" title={`${project.name} · ${project.location}`}>{project.name} · {project.location}</span>
        <div className="header-actions">
          <button type="button" className="header-button header-panel-toggle desktop-only" aria-expanded={!panelCollapsed} aria-controls="layer-panel" onClick={() => setPanelCollapsed(!panelCollapsed)}><Icon name="panelLeft" /><span>Camadas</span></button>
          <button type="button" className="header-button" aria-label="Sobre os dados" onClick={() => setAboutOpen(true)}><Icon name="info" /><span>Sobre os dados</span></button>
        </div>
      </header>
      {panelOpen && <button type="button" className="sheet-backdrop" aria-label="Fechar painel de camadas" onClick={() => setPanelOpen(false)} />}
      <aside id="layer-panel" aria-label="Área de trabalho e camadas" className={`layer-panel ${panelOpen ? "is-open" : ""} ${sheetHigh ? "is-high" : ""}`}>
        <LayerPanel project={project} visible={visible} rasterOpacities={rasterOpacities} onOpacityChange={setRasterOpacity} onToggle={toggleLayer} onClose={() => setPanelOpen(false)} onCollapse={() => setPanelCollapsed(true)} sheetHigh={sheetHigh} onToggleSheetHeight={() => setSheetHigh(!sheetHigh)} />
      </aside>
      <div className="map-tools">
        <NavigationControls viewer={viewer} homeCamera={project.initialCamera} disabled={Boolean(error)} />
        <MeasurementToolbar viewer={viewer} disabled={Boolean(error)} />
      </div>
      <VectorPopup viewer={viewer} />
      {ModelDevelopmentTools && (project.developmentTools?.modelAlignment || project.developmentTools?.cropAuthoring) &&
        <Suspense fallback={null}>
          {project.layers.filter(layer => layer.source.format === "3d-tiles" && visible.has(layer.id)).map(layer =>
            <ModelDevelopmentTools key={layer.id} viewer={viewer} tileset={getModel(layer.id)} alignment={Boolean(project.developmentTools?.modelAlignment)} crop={Boolean(project.developmentTools?.cropAuthoring)} />)}
        </Suspense>}
      {(error || mapWarning) && <div role="alert" className="map-alert">{error || mapWarning}</div>}
      {!viewer && !error && <div role="status" className="map-alert">Iniciando o visualizador 3D…</div>}
      {legendLayers.length > 0 && <div className="raster-legend-stack" role="group" aria-label="Legendas das camadas visíveis">
        <div id="legend-items" className="raster-legend-stack-items" hidden={!legendOpen}>
          {legendLayers.map((layer) => layer.legend && <Legend key={layer.id} {...layer.legend} visibility={visible.has(layer.id)} />)}
        </div>
        <button type="button" className="legend-toggle" aria-controls="legend-items" aria-expanded={legendOpen} onClick={() => setLegendOpen(!legendOpen)}>Legenda · {legendLayers.length}<Icon name="chevronDown" size={14} /></button>
      </div>}
      <nav className="mobile-bar" aria-label="Ferramentas do mapa">
        <button type="button" aria-pressed={panelOpen} aria-expanded={panelOpen} aria-controls="layer-panel" onClick={() => setPanelOpen(!panelOpen)}><span><Icon name="layers" size={20} /></span>Camadas</button>
        <button type="button" aria-pressed={!panelOpen && mobileView === "measure"} onClick={() => showMobileView("measure")}><span><Icon name="ruler" size={20} /></span>Medir</button>
        {legendLayers.length > 0 && <button type="button" aria-pressed={!panelOpen && mobileView === "legend"} onClick={() => showMobileView("legend")}><span><Icon name="legend" size={20} /></span>Legenda</button>}
      </nav>
      <AboutDialog project={project} open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
