import { useEffect, useRef } from "react";
import type { ProjectConfig } from "../projects/types";
import { Icon } from "./icons";

export function AboutDialog({ project, open, onClose }: { project: ProjectConfig; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={dialogRef} className="about-dialog" aria-labelledby="about-title" onClose={onClose} onClick={event => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <div className="about-dialog-body">
      <header><h2 id="about-title">Sobre os dados</h2><button type="button" className="about-close" aria-label="Fechar" onClick={onClose}><Icon name="close" /></button></header>
      <p>{project.name} · {project.location}</p>
      <h3>Camadas do projeto</h3>
      <ul>{project.layers.map(layer => <li key={layer.id}><strong>{layer.name}</strong>{layer.description && ` — ${layer.description}`}</li>)}</ul>
      <h3>Medições</h3>
      <p>Altitudes elipsoidais (m). Área horizontal geográfica, sem relevo.</p>
      <h3>Créditos</h3>
      <p>As atribuições das fontes e do Cesium estão disponíveis no rodapé do mapa.</p>
    </div>
  </dialog>;
}
