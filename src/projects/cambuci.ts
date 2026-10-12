import type { GeographicBounds, ProjectConfig, ProjectLayerConfig } from "./types";
import { cambuciMacroLayers } from "./cambuciMacro";

const baseUrl = "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev";
const orthoBounds: GeographicBounds = [-42.01171875, -21.57571893, -41.92382812, -21.49396356];
const terrainBounds: GeographicBounds = [-42.01171875, -21.61657934, -41.83593750, -21.45306863];

function raster(id: string, name: string, path: string, legend?: string): ProjectLayerConfig {
  const ortho = id === "ortomosaico";
  return {
    id, name, description: id === "declividade" ? "Declividade em graus" : name, kind: "raster",
    source: {
      format: "tms", url: `${baseUrl}/${path}/{z}/{x}/{reverseY}.png`,
      credit: "Cardeal Map", bounds: ortho ? orthoBounds : terrainBounds,
      minimumLevel: ortho ? 13 : 11, maximumLevel: ortho ? 22 : 20,
      tileWidth: 256, tileHeight: 256,
    },
    defaultVisible: ortho,
    ...(legend ? { legend: { type: "image" as const, title: name, imageUrl: `/legends/${legend}`, imageAlt: `Legenda de ${name}` } } : {}),
  };
}

export const cambuciProject: ProjectConfig = {
  id: "cambuci", name: "Cardeal Map", location: "Cambuci - Rio de Janeiro", bounds: orthoBounds,
  initialCamera: {
    longitude: -41.9638881,
    latitude: -21.5335236,
    height: 2201.04,
    heading: 58.52,
    pitch: -54.11,
    roll: 360.00,
  },
  panelSubheadings: {
    macro: [
      {
        title: "CONTEXTO TERRITORIAL",
        layerIds: ["macro-contexto-municipal-ibge", "macro-clima"],
      },
      {
        title: "MEIO FÍSICO",
        layerIds: ["macro-geologia", "macro-geomorfologia", "macro-pedologia", "macro-vegetacao"],
      },
      {
        title: "RELEVO E HIDROLOGIA",
        layerIds: [
          "macro-elevacao-anadem",
          "macro-curvas-anadem",
          "macro-limite-microbacias-anadem",
          "macro-microbacias-anadem",
          "macro-drenagem-ana",
          "macro-drenagem-anadem",
        ],
      },
    ],
  },
  layers: [
    {
      id: "basemap", name: "Bing Aerial com rótulos", description: "Bing Maps via Cesium ion", kind: "basemap",
      source: { format: "ion-world-imagery", fallback: {
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maximumLevel: 19,
        credit: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>',
      } }, defaultVisible: true,
    },
    raster("ortomosaico", "Ortomosaico", "orto"),
    raster("mdt", "Modelo Digital do Terreno", "mdt", "mdt_tab.png"),
    raster("mds", "Modelo Digital da Superfície", "mds", "mds_tab.png"),
    // These original legend images are still missing; the generic image legend hides failed loads.
    raster("declividade", "Declividade", "decli", "decli_tab.png"),
    raster("orientacao-solar", "Orientação solar", "aspect", "aspect_tab.png"),
    {
      id: "perimetro", name: "Perímetro dos imóveis", description: "Limites dos imóveis", kind: "property-boundary", defaultVisible: true,
      source: { format: "geojson", url: `${baseUrl}/geojson/peri_imoveis.geojson`, autoZoom: false,
        style: { stroke: "#ff3030", strokeWidth: 4, fill: "#00000000", clampToGround: true, zIndex: 30 },
        popup: { title: "Perímetro do imóvel", fields: [
          { property: "ENCLOSED_AREA", label: "Área", numericText: true, numberFormat: { locale: "pt-BR", decimalPlaces: 3 } },
        ] } },
    },
    {
      id: "curvas", name: "Curvas de nível 3 m", description: "Cotas em metros, intervalo de 3 m", kind: "contours", defaultVisible: false,
      source: { format: "geojson", url: `${baseUrl}/geojson/curvas_3m.geojson`, autoZoom: false,
        style: { stroke: "black", strokeWidth: 1.5, clampToGround: true, zIndex: 10 },
        popup: { title: "Curva de nível", fields: [{ property: "ELEVATION", label: "Cota", decimals: 0, suffix: " m" }] } },
    },
    {
      id: "drenagem", name: "Rede de drenagem", description: "Hierarquia de Strahler", kind: "drainage", defaultVisible: false,
      source: { format: "geojson", url: `${baseUrl}/geojson/rede_drenagem.geojson`, autoZoom: false,
        style: { stroke: "#32bdeb", strokeWidth: 2, clampToGround: true, zIndex: 20,
          classification: { property: "STRAHLER", classes: {
            "1": { stroke: "#68dcff", strokeWidth: 2 }, "2": { stroke: "#32bdeb", strokeWidth: 3 },
            "3": { stroke: "#1597e5", strokeWidth: 4.5 }, "4": { stroke: "#0875dc", strokeWidth: 6 },
          } } },
        popup: { title: "Rede de drenagem", fields: [
          { property: "STREAM_ID", label: "Trecho", format: "integer" },
          { property: "DRAIN_AREA", label: "Área de drenagem" },
          { property: "STRAHLER", label: "Ordem de Strahler", format: "integer" },
          { property: "IN_FLOW", label: "Fluxo de entrada" }, { property: "OUT_FLOW", label: "Fluxo de saída" },
        ] } },
    },
    {
      id: "microbacias", name: "Microbacias", description: "Somente polígonos; cores por STREAM_ID", kind: "vector", defaultVisible: false,
      source: { format: "geojson", url: `${baseUrl}/geojson/microbacias.geojson`, autoZoom: false,
        geometryTypes: ["Polygon"], uniqueFeatureIds: true,
        style: { stroke: "#f1f5ff", strokeWidth: 2, fillOpacity: 0.3, clampToGround: true, zIndex: 1,
          deterministicFill: { property: "STREAM_ID", colors: ["#51b6e8", "#f2b84b", "#ac83df", "#63c49d", "#ef879b", "#8fc760", "#e8985d", "#7da1ef"] } },
        popup: { title: "Microbacia", fields: [
          { property: "STREAM_ID", label: "Trecho", format: "integer" },
          { property: "NEXT_STREAM_ID", label: "Próximo trecho", format: "integer" },
        ] } },
    },
    {
      id: "modelo-3d", name: "Modelo 3D", description: "Cesium ion", kind: "3d-tiles", defaultVisible: false,
      source: {
        format: "3d-tiles", source: "ion", assetId: 5966108, tokenEnv: "VITE_CESIUM_3D_TOKEN",
        clipping: {
          inverse: true, // Keep the interior and clip everything outside this polygon.
          positions: [
            [-41.95379290, -21.51531209],
            [-41.97043460, -21.51550125],
            [-41.97087221, -21.52085767],
            [-41.96877350, -21.52413933],
            [-41.96114723, -21.52740751],
            [-41.95736496, -21.52843547],
            [-41.95705373, -21.53145989],
            [-41.95679086, -21.53585639],
            [-41.95689642, -21.53866952],
            [-41.95218591, -21.53977463],
            [-41.94646710, -21.53277521],
            [-41.94377581, -21.52802323],
            [-41.94611890, -21.52169740],
            [-41.95068445, -21.51902994],
            [-41.95229922, -21.51652441],
          ],
        },
      },
    },
    ...cambuciMacroLayers,
  ],
};
