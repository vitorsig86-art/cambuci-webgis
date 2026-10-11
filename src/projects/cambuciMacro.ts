import type { ProjectLayerConfig } from "./types";

const municipalPopulationFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const municipalPercentFormat = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatMunicipalPopulation(value: unknown, percentage: number): string {
  return `${municipalPopulationFormat.format(Number(value))} — ${municipalPercentFormat.format(percentage)}%`;
}

// Field names were inspected in the local GeoJSON copies.
// Keep existing units; do not infer units for ANA numeric attributes.
export const cambuciMacroLayers: ProjectLayerConfig[] = [
  {
    id: "macro-elevacao-anadem",
    name: "Modelo de Elevação ANADEM",
    description: "Modelo de Elevação ANADEM",
    kind: "raster",
    group: "macro",
    defaultVisible: false,
    opacityControl: true,
    source: {
      format: "tms",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/dem_macro/{z}/{x}/{reverseY}.png",
      credit: "ANADEM",
      minimumLevel: 10,
      maximumLevel: 19,
      bounds: [-42.1875, -21.616579337, -41.8359375, -21.289374356],
      tileWidth: 256,
      tileHeight: 256,
    },
  },
  {
    id: "macro-contexto-municipal-ibge",
    name: "Contexto Municipal IBGE",
    description: "Contexto territorial e populacional do município",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/info_municipio.geojson",
      autoZoom: false,
      style: {
        stroke: "#dce4ec",
        strokeWidth: 2,
        fill: "#8297ad",
        fillOpacity: 0.1,
        clampToGround: true,
        zIndex: 0,
      },
      popup: {
        title: "Cambuci — RJ",
        hideEmpty: true,
        fields: [
          { property: "Pop_Tot_Mu", label: "População total", format: "integer", suffix: " habitantes" },
          {
            property: "Pop_Rur_Mu",
            label: "População rural",
            valueFormatter: (value, properties) => formatMunicipalPopulation(value, Number(value) / Number(properties.Pop_Tot_Mu) * 100),
          },
          {
            property: "Pop_Urb_Mu",
            label: "População urbana",
            valueFormatter: (value, properties) => formatMunicipalPopulation(value, Number(properties.Perc_Urb_U)),
          },
          {
            property: "Tipologia_",
            label: "Tipologia territorial",
            valueFormatter: (value) => value === "RuralAdjacente" ? "Rural Adjacente" : String(value),
          },
          {
            property: "Classes_Pe",
            label: "Urbanização",
            valueFormatter: (value) => value === "Unidade populacional com baixo grau de urbanizacao" ? "Baixo grau de urbanização" : String(value),
          },
          { property: "Classes_Po", label: "Classificação populacional" },
        ],
      },
    },
  },
  {
    id: "macro-geologia",
    name: "Geologia IBGE",
    description: "Geologia IBGE",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/geologia.geojson",
      autoZoom: false,
      style: {
        stroke: "#605568",
        strokeWidth: 1.5,
        fill: "#c58967",
        fillOpacity: 0.53,
        clampToGround: true,
        zIndex: 2,
        deterministicFill: {
          property: "nm_unidade",
          colors: [
            "#d69a68",
            "#a985c6",
            "#debf65",
            "#80b3a3",
            "#ce8090",
            "#8faad4"
          ]
        }
      },
      popup: {
        title: "Geologia IBGE",
        fields: [
          {
            property: "nm_unidade",
            label: "Unidade geológica"
          },
          {
            property: "nm_lito1",
            label: "Litologia principal"
          },
          {
            property: "nm_lito2",
            label: "Litologia complementar"
          },
          {
            property: "nm_tempo_g",
            label: "Idade geológica"
          },
          {
            property: "nm_provinc",
            label: "Província geológica"
          },
          {
            property: "nm_sub_pro",
            label: "Subprovíncia geológica"
          }
        ],
        hideEmpty: true
      }
    }
  },
  {
    id: "macro-geomorfologia",
    name: "Geomorfologia IBGE",
    description: "Geomorfologia IBGE",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/geomorfologia.geojson",
      autoZoom: false,
      style: {
        stroke: "#77572e",
        strokeWidth: 1.5,
        fill: "#bc9453",
        fillOpacity: 0.5,
        clampToGround: true,
        zIndex: 2
      },
      popup: {
        title: "Geomorfologia IBGE",
        fields: [
          {
            property: "nm_dominio",
            label: "Domínio geomorfológico"
          },
          {
            property: "nm_regiao",
            label: "Região geomorfológica"
          },
          {
            property: "nm_unidade",
            label: "Unidade geomorfológica"
          },
          {
            property: "caract",
            label: "Tipo de dissecação"
          },
          {
            property: "categoria",
            label: "Categoria"
          },
          {
            property: "forma",
            label: "Forma do topo"
          },
          {
            property: "compartime",
            label: "Compartimento"
          }
        ],
        hideEmpty: true
      }
    }
  },
  {
    id: "macro-pedologia",
    name: "Pedologia IBGE",
    description: "Pedologia IBGE",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/pedologia.geojson",
      autoZoom: false,
      style: {
        stroke: "#714128",
        strokeWidth: 1.5,
        fill: "#b8784e",
        fillOpacity: 0.5,
        clampToGround: true,
        zIndex: 2
      },
      popup: {
        title: "Pedologia IBGE",
        fields: [
          {
            property: "legenda_2",
            label: "Classe de solo"
          },
          {
            property: "grande_gru",
            label: "Grande grupo"
          },
          {
            property: "subgrupos",
            label: "Subgrupo"
          },
          {
            property: "textura",
            label: "Textura"
          },
          {
            property: "horizonte",
            label: "Horizonte"
          },
          {
            property: "relevo",
            label: "Relevo"
          },
          {
            property: "componente",
            label: "Componentes"
          },
          {
            property: "inclu_p1",
            label: "Inclusões"
          }
        ],
        hideEmpty: true
      }
    }
  },
  {
    id: "macro-vegetacao",
    name: "Vegetação IBGE",
    description: "Vegetação IBGE",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/vegetacao.geojson",
      autoZoom: false,
      style: {
        stroke: "#365939",
        strokeWidth: 1.5,
        fill: "#a8c65a",
        fillOpacity: 0.5,
        clampToGround: true,
        zIndex: 2,
        classification: {
          property: "nm_uantr",
          classes: {
            "Pecuária (pastagens)": {
              fill: "#c5d875"
            },
            "Vegetação Secundária sem palmeiras": {
              fill: "#367447"
            }
          }
        }
      },
      popup: {
        title: "Vegetação IBGE",
        fields: [
          {
            property: "nm_uantr",
            label: "Uso/cobertura atual"
          },
          {
            property: "nm_sec1",
            label: "Vegetação secundária"
          },
          {
            property: "nm_sec2",
            label: "Cobertura complementar"
          },
          {
            property: "nm_pretet",
            label: "Vegetação pretérita"
          }
        ],
        hideEmpty: true
      }
    }
  },
  {
    id: "macro-clima",
    name: "Clima IBGE",
    description: "Clima IBGE",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/clima.geojson",
      autoZoom: false,
      style: {
        stroke: "#428fa6",
        strokeWidth: 1.5,
        fill: "#62c9e0",
        fillOpacity: 0.18,
        clampToGround: true,
        zIndex: 2
      },
      popup: {
        title: "Clima IBGE",
        fields: [
          {
            property: "ZONA",
            label: "Zona climática"
          },
          {
            property: "TP_UMIDADE",
            label: "Umidade"
          },
          {
            property: "DISTR_UMID",
            label: "Período seco"
          },
          {
            property: "TEMPERATUR",
            label: "Condição térmica"
          }
        ],
        hideEmpty: true
      }
    }
  },
  {
    id: "macro-curvas-anadem",
    name: "Curvas de nível 8 m — ANADEM",
    description: "Curvas de nível 8 m — ANADEM",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/curvas_8m_anadem.geojson",
      autoZoom: false,
      style: {
        stroke: "black",
        strokeWidth: 1,
        clampToGround: true,
        zIndex: 10
      },
      popup: {
        title: "Curva de nível",
        fields: [
          {
            property: "ELEVATION",
            label: "Cota",
            numericText: true,
            decimals: 0
          }
        ],
        hideEmpty: true
      }
    }
  },
  {
    id: "macro-drenagem-anadem",
    name: "Simulação de drenagem ANADEM",
    description: "Simulação de drenagem ANADEM",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/simu_drenagem.geojson",
      autoZoom: false,
      style: {
        stroke: "#32bdeb",
        strokeWidth: 2,
        clampToGround: true,
        zIndex: 20,
        classification: {
          property: "STRAHLER",
          classes: {
            "1": {
              stroke: "#68dcff",
              strokeWidth: 2
            },
            "2": {
              stroke: "#32bdeb",
              strokeWidth: 3
            },
            "3": {
              stroke: "#1597e5",
              strokeWidth: 4.5
            },
            "4": {
              stroke: "#0875dc",
              strokeWidth: 6
            }
          }
        }
      },
      popup: {
        title: "Simulação de drenagem ANADEM",
        fields: [
          {
            property: "STRAHLER",
            label: "Ordem Strahler",
            format: "integer"
          },
          {
            property: "DRAIN_AREA",
            label: "Área drenada",
            numericText: true,
            decimals: 3
          },
          {
            property: "STREAM_ID",
            label: "STREAM_ID",
            format: "integer"
          },
          {
            property: "IN_FLOW",
            label: "Fluxo de entrada",
            format: "integer"
          },
          {
            property: "OUT_FLOW",
            label: "Fluxo de saída",
            format: "integer"
          }
        ],
        hideEmpty: true
      }
    }
  },
  {
    id: "macro-microbacias-anadem",
    name: "Microbacias simuladas ANADEM",
    description: "Microbacias simuladas ANADEM",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/simu_microbacias.geojson",
      autoZoom: false,
      style: {
        stroke: "#e4edf7",
        strokeWidth: 2,
        fill: "#51b6e8",
        fillOpacity: 0.43,
        clampToGround: true,
        zIndex: 3,
        deterministicFill: {
          property: "STREAM_ID",
          colors: [
            "#51b6e8",
            "#f2b84b",
            "#ac83df",
            "#63c49d",
            "#ef879b",
            "#8fc760",
            "#e8985d",
            "#7da1ef"
          ]
        }
      },
      popup: {
        title: "Microbacias simuladas ANADEM",
        fields: [
          {
            property: "STREAM_ID",
            label: "STREAM_ID",
            format: "integer"
          },
          {
            property: "ENCLOSED_AREA",
            label: "Área",
            numericText: true,
            decimals: 3
          },
          {
            property: "PERIMETER",
            label: "Perímetro",
            numericText: true,
            decimals: 3
          },
          {
            property: "NEXT_STREAM_ID",
            label: "Próximo trecho",
            format: "integer"
          }
        ],
        hideEmpty: true
      }
    }
  },
  {
    id: "macro-limite-microbacias-anadem",
    name: "Limite das microbacias ANADEM",
    description: "Limite das microbacias ANADEM",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/limite_microbacias_anadem.geojson",
      autoZoom: false,
      style: {
        stroke: "#8c40cc",
        strokeWidth: 2.5,
        fill: "#00000000",
        fillOpacity: 0,
        clampToGround: true,
        zIndex: 5
      },
      popup: {
        title: "Limite das microbacias ANADEM",
        fields: [
          {
            property: "wts_cd_pfafstetterbasin",
            label: "Código Pfafstetter"
          },
          {
            property: "wts_cd_pfafstetterbasincodeleve",
            label: "Nível Pfafstetter",
            format: "integer"
          }
        ],
        hideEmpty: true
      }
    }
  },
  {
    id: "macro-drenagem-ana",
    name: "Drenagem ANA",
    description: "Drenagem ANA",
    kind: "vector",
    group: "macro",
    lazyLoad: true,
    defaultVisible: false,
    source: {
      format: "geojson",
      url: "https://pub-ad150dc7fa674abe84ecb9050c9906dc.r2.dev/geojson/drenagem_ana.geojson",
      autoZoom: false,
      style: {
        stroke: "#16468f",
        strokeWidth: 4,
        clampToGround: true,
        zIndex: 25
      },
      popup: {
        title: "Drenagem ANA",
        fields: [
          {
            property: "nuordemcda",
            label: "Ordem da drenagem",
            format: "integer"
          },
          {
            property: "cocursodag",
            label: "Código do curso d’água"
          },
          {
            property: "nunivotcda",
            label: "Nível do curso d’água",
            format: "integer"
          },
          {
            property: "nucompcda",
            label: "Comprimento do curso",
            numericText: true,
            decimals: 2
          },
          {
            property: "nuareabacc",
            label: "Área da bacia contribuinte",
            numericText: true,
            decimals: 2
          },
          {
            property: "nudistbacc",
            label: "Distância na bacia",
            numericText: true,
            decimals: 2
          }
        ],
        hideEmpty: true
      }
    }
  }
];
