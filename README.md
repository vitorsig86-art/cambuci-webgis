# Antonio C. Martelletto

WebGIS Cardeal Map — Cambuci - Rio de Janeiro.
Projeto independente do template validado, cuja origem permanece somente leitura.

## Executar

Use `npm ci`, `npm run dev`, `npm run typecheck` e `npm run build`.
Neste sandbox Windows, o carregador padrão de configuração do esbuild encontrou
uma restrição de acesso. A validação de produção passou com
`npm run build -- --configLoader runner`, alternativa nativa do Vite.
Configure `.env.local` com `VITE_CESIUM_ION_TOKEN` para World Terrain/Bing
Aerial com rótulos e `VITE_CESIUM_3D_TOKEN` para o asset ion 5966108.
O template de origem não contém `.env.local`. `.env.example` contém apenas
campos vazios. Configure as variáveis no ambiente de build para implantação.

## Configuração

`src/projects/cambuci.ts` e `src/projects/cambuciMacro.ts` concentram as URLs,
bounds, níveis de zoom, estilos e popups. A configuração atual tem 23 camadas:
mapa base, seis rasters TMS Web Mercator com `{reverseY}`, quinze GeoJSONs
e um modelo ion com seu recorte configurado. Inclui Análise Macro;
não há seletor de projetos. Mapa base, ortomosaico e perímetro iniciam visíveis.
Declividade é expressa em graus; não há classificação EMBRAPA em porcentagem.
Microbacias filtra Polygon e recebe cores estáveis por STREAM_ID.
Nenhuma unidade foi presumida para DRAIN_AREA, IN_FLOW ou OUT_FLOW.

MDS e MDT usam imagens originais, copiadas sem alterações. Faltam os arquivos
originais `decli(20261010-145450).png` e `aspect.png`. Seus destinos já estão
configurados: `public/legends/decli_tab.png` e `public/legends/aspect_tab.png`.
Não há imagens fictícias; a legenda genérica oculta imagens que não carregam.

A câmera definitiva está definida em `initialCamera` em `src/projects/cambuci.ts`
(ângulos em graus, altura em metros). A abertura e o botão Home usam essa mesma
configuração por meio de `createCameraView` em `src/cesium/projectCamera.ts`.

Medições, navegação/Home, opacidade, atribuição e recuperação
TMS 404/410 conservam a arquitetura existente. Os exemplos neutros usados
pelos checks genéricos ficam somente em scripts/fixtures; não entram no WebGIS.

## Interface Cardeal Map

A apresentação usa o tema v3 do template de referência: `src/theme.css`,
Figtree e Caprasimo locais (licenças em `public/fonts`), ícones compartilhados,
cabeçalho de 52 px, painel recolhível, switches e coluna de ferramentas.
No celular, Camadas abre um painel inferior de duas alturas; Medir e Legenda
selecionam a sobreposição do mapa. As legendas mantêm expansão por toque.
Não foram adicionados GPS, campanhas temporais, comparação ou modo 2D.
Viewer, hooks geográficos, configuração territorial e fontes permanecem intactos.

Validação da modernização: `npm.cmd ci`, `npm.cmd run typecheck`,
`npm.cmd run check` e `npm.cmd run build -- --configLoader runner` passaram.
Dev e preview responderam HTTP 200. Fontes R2 foram verificadas por HEAD com
CORS liberado, incluindo amostras dos rasters; isso não valida o georreferenciamento
nem o carregamento completo. A inspeção visual desktop/tablet/mobile, o console
e os serviços ion ainda precisam ser verificados no navegador: o acesso de
automação ao navegador estava indisponível durante esta execução.
