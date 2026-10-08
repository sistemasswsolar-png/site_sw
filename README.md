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

A linguagem segue a referência (meuassessor.com), com as cores e o conteúdo da SW:

- Cabeçalho em pílula de vidro, que fica claro sobre seções claras (`data-theme="light"`).
- Cada bloco entra como uma "folha" de cantos arredondados sobre o anterior (classe `sheet`).
- Topo com celular e conversa animada no WhatsApp (`HeroChat.astro`); os números vêm do simulador.
- Trajetória e depoimentos em formato de stories, avançando sozinhos (`data-story`).
- Estrutura com palco fixo na rolagem (Estoque → Logística → Equipe), só no computador.
- Engenharia com foto fixa e trilho de etapas que se preenche.
- Usinas em cartões que empilham, balões de perguntas em faixas, esfera de partículas no fechamento.

Como funciona: `src/scripts/motion.ts` escreve a variável `--p` (0 a 1) nos elementos com `data-prog`, e o CSS (`src/styles/cinema.css`) transforma isso em movimento. `src/scripts/scenes.ts` cuida dos stories e da conversa; `src/scripts/esfera.ts`, da esfera (canvas, sem biblioteca).

Só animam `transform` e `opacity`, nada roda fora da tela, e tudo desliga para quem ativou "reduzir movimento" no sistema. Se o JavaScript falhar, a página aparece completa e sem animação.
