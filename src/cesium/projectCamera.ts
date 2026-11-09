import { Cartesian3, Math as CesiumMath, type Viewer } from "cesium";
import type { ProjectConfig, CameraConfig } from "../projects/types";

export function createCameraView(camera: CameraConfig) {
  return {
    destination: Cartesian3.fromDegrees(camera.longitude, camera.latitude, camera.height),
    orientation: {
      heading: CesiumMath.toRadians(camera.heading),
      pitch: CesiumMath.toRadians(camera.pitch),
      roll: CesiumMath.toRadians(camera.roll),
    },
  };
}

// Omit duration for immediate opening; supply it for an animated Home action.
export function applyProjectCamera(viewer: Viewer, project: ProjectConfig, duration?: number): void {
  if (viewer.isDestroyed()) return;
  const camera = project.initialCamera;
  if (!camera) return;
  const view = createCameraView(camera);

  if (duration !== undefined) {
    viewer.camera.flyTo({ ...view, duration });
  } else {
    viewer.camera.cancelFlight();
    viewer.camera.setView(view);
  }
  viewer.scene.requestRender();
}

// Exact camera pose, to put the camera back after an overlay (embedded page).
// Ported from cardeal-map-template 3.1.0.
export interface CameraSnapshot { position: Cartesian3; heading: number; pitch: number; roll: number }

export function captureCamera(viewer: Viewer): CameraSnapshot {
  const { camera } = viewer;
  return { position: Cartesian3.clone(camera.positionWC), heading: camera.heading, pitch: camera.pitch, roll: camera.roll };
}

// Restores the pose without animation, only when something moved it. Returns true when it restored.
export function restoreCamera(viewer: Viewer, snapshot: CameraSnapshot): boolean {
  if (viewer.isDestroyed()) return false;
  const { camera } = viewer;
  camera.cancelFlight();
  const same = Cartesian3.equalsEpsilon(camera.positionWC, snapshot.position, 0, 1e-3)
    && [[camera.heading, snapshot.heading], [camera.pitch, snapshot.pitch], [camera.roll, snapshot.roll]]
      .every(([a, b]) => CesiumMath.equalsEpsilon(CesiumMath.negativePiToPi(a - b), 0, 1e-6));
  if (same) return false;
  camera.setView({ destination: snapshot.position, orientation: { heading: snapshot.heading, pitch: snapshot.pitch, roll: snapshot.roll } });
  viewer.scene.requestRender();
  return true;
}
