import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { HeadingPitchRange, Math as CesiumMath, type Entity } from "cesium";
import { projects } from "./projects";
import { LayerPanel } from "./components/LayerPanel";
import { Legend } from "./components/Legend";
import { NavigationControls } from "./components/NavigationControls";
import { MeasurementToolbar } from "./components/MeasurementToolbar";
import { VectorPopup } from "./components/VectorPopup";
import { Icon } from "./components/icons";
import { AboutDialog } from "./components/AboutDialog";
import { initialMobileState, isMobileLayout } from "./components/mobileTabs";

import { useCesiumViewer } from "./hooks/useCesiumViewer";
import { useProjectLayers } from "./hooks/useProjectLayers";
import { applyProjectCamera, captureCamera, createCameraView, restoreCamera, type CameraSnapshot } from "./cesium/projectCamera";
import type { VectorPopupActionLink } from "./cesium/vectorPopup";
import type { ProjectConfig } from "./projects/types";

const ModelDevelopmentTools = import.meta.env.DEV ? lazy(() => import("./components/ModelDevelopmentTools")) : null;
const EmbeddedPageOverlay = lazy(() => import("./components/EmbeddedPageOverlay"));

// Layers on at the opening: defaultVisibleMobile overrides defaultVisible in the mobile layout.
function defaultVisibility(project: ProjectConfig) {
  const mobile = isMobileLayout();
  return new Set(project.layers.filter((layer) => mobile ? layer.defaultVisibleMobile ?? layer.defaultVisible : layer.defaultVisible).map((layer) => layer.id));
}

export function App() {
  const project = projects[0];
  const [visible, setVisible] = useState(() => defaultVisibility(projects[0]));
  // Mobile opens with only the map and the bottom bar unless
  // panel.mobileStartOpen is true. Desktop ignores panelOpen.
  const [panelOpen, setPanelOpen] = useState(() => initialMobileState(project.panel?.mobileStartOpen ?? false).panelOpen);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [sheetHigh, setSheetHigh] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"measure" | "legend" | "none">("none");
  const { containerRef, viewer, error } = useCesiumViewer();
  const { mapWarning, rasterOpacities, setRasterOpacity, getModel } = useProjectLayers(viewer, project, visible);
  const legendLayers = project.layers.filter((layer) => layer.legend && visible.has(layer.id));
  const [page, setPage] = useState<{ url: string; title: string } | null>(null);
  // Camera when the page opened and what to do with it on close (action.onClose).
  const pageCamera = useRef<{ snapshot: CameraSnapshot; onClose: "keep" | "home" } | null>(null);

  // Popup action: optional flight (action.flyTo), then the page over the map.
  async function openPage({ action, title, entity }: { action: VectorPopupActionLink; title: string; entity: Entity }) {
    if (action.target === "tab") { window.open(action.url, "_blank", "noopener"); return; }
    if (viewer && !viewer.isDestroyed()) {
      viewer.selectedEntity = undefined;
      if (action.flyTo === "home" && project.initialCamera) {
        const home = createCameraView(project.initialCamera);
        await new Promise<void>(resolve => viewer.camera.flyTo({ ...home, duration: 1.6, complete: resolve, cancel: resolve }));
      } else if (action.flyTo === true) {
        const target = entity.parent?.polygon ? entity.parent : entity;
        await viewer.flyTo(target, { duration: 1.6, offset: new HeadingPitchRange(viewer.camera.heading, CesiumMath.toRadians(-45), 0) });
      }
    }
    pageCamera.current = viewer && !viewer.isDestroyed() ? { snapshot: captureCamera(viewer), onClose: action.onClose } : null;
    setPage({ url: action.url, title });
  }

  // Closing the page never animates: "keep" restores the pose saved at opening
  // (only if something moved it), "home" jumps to the opening view.
  const closePage = useCallback(() => {
    const saved = pageCamera.current;
    pageCamera.current = null;
    setPage(null);
    if (!saved || !viewer || viewer.isDestroyed()) return;
    if (saved.onClose === "home") applyProjectCamera(viewer, project);
    else restoreCamera(viewer, saved.snapshot);
  }, [viewer, project]);

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
      <VectorPopup viewer={viewer} allowedOrigins={project.embeddedPages?.allowedOrigins} onOpenPage={openPage} />
      {page && <Suspense fallback={null}><EmbeddedPageOverlay url={page.url} title={page.title} onClose={closePage} /></Suspense>}
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
