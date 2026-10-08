# Site SW Solar

Site institucional da SW Solar, feito a partir da apresentação comercial. Astro (HTML estático), sem framework de JavaScript no navegador.

## Rodar

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # gera dist/ (otimiza as imagens em AVIF/WebP)
npm run preview   # serve o dist/
```

Na Vercel: importar o repositório. O preset Astro é detectado sozinho.

## Onde editar

| O quê | Arquivo |
|---|---|
| Contatos, unidades, números, usinas, obras, depoimentos, valores do app | `src/data/site.ts` |
| Parâmetros do simulador (tarifas, Fio B, impostos, geração por cidade, preço de referência) | `src/data/simulador.ts` |
| Cálculo do simulador | `src/lib/simular.ts` |
| Textos e ordem das seções | `src/pages/index.astro` |
| Cores, fontes e animações | `src/styles/global.css` |
| Fotos | `src/assets/img/` (otimizadas no build) |
| Vídeos | `public/video/` (só baixam quando o visitante clica) |

## Simulador: fontes dos dados

- **Tarifas e Fio B**: ANEEL, Dados Abertos, conjunto `componentes-tarifarias-2026`, classe B1 convencional, tarifa de aplicação. Copel: REH 3.592/2026, vigente desde 24/06/2026. Celesc: vigente desde 22/08/2026. Atualizar a cada reajuste anual.
- **Geração solar por cidade**: PVGIS 5.3 (Comissão Europeia, JRC), base PVGIS-ERA5, inclinação ótima, 14% de perdas. Para incluir uma cidade, consultar `https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=LAT&lon=LON&peakpower=1&loss=14&raddatabase=PVGIS-ERA5&optimalangles=1&outputformat=json` e copiar os 12 valores de `E_m`.
- **Lei 14.300**: Fio B de 60% em 2026, 75% em 2027 e 90% em 2028. A partir de 2029 o simulador assume 100%.
- **Preço de referência**: Greener, estudo Soluções Energéticas Distribuídas do 1º semestre de 2026. Para usar a tabela de preços da SW, trocar `PRECO_WP`.

## Animações

Disparadas ao entrar na tela (IntersectionObserver). Só animam `transform` e `opacity`. Ficam desligadas para quem ativou "reduzir movimento" no sistema. Se o JavaScript falhar, a página aparece completa e sem animação.
