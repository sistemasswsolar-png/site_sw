/* =====================================================================
   SW SOLAR | PARÂMETROS DO SIMULADOR
   Todos os valores têm fonte pública. Atualize quando houver reajuste.
   ===================================================================== */

/* Tarifas B1 convencional (Tarifa de Aplicação, sem impostos) e componente
   TUSD Fio B, em R$/kWh. Fonte: ANEEL, Dados Abertos "componentes-tarifarias-2026".
   Copel: REH nº 3.592/2026, vigente de 24/06/2026 a 23/06/2027.
   Celesc: revisão tarifária vigente desde 22/08/2026. */
export const DISTRIBUIDORAS = {
  PR: { nome: 'Copel', tusd: 0.45717, te: 0.31085, fioB: 0.21454, vigencia: 'REH ANEEL 3.592/2026, desde 24/06/2026' },
  SC: { nome: 'Celesc', tusd: 0.41404, te: 0.34571, fioB: 0.13279, vigencia: 'Revisão tarifária ANEEL, desde 22/08/2026' },
} as const;

/* Tributos sobre a conta. ICMS: PR 19% (alíquota única residencial);
   SC 12% até 150 kWh e 17% acima. PIS/COFINS: alíquota efetiva média, varia mês a mês. */
export const TRIBUTOS = {
  icms: { PR: () => 0.19, SC: (kwh: number) => (kwh <= 150 ? 0.12 : 0.17) },
  pisCofins: 0.06,
};

/* Custo de disponibilidade (kWh mínimos faturados), REN ANEEL 1.000/2021. */
export const LIGACOES = [
  { id: 'mono', nome: 'Monofásica', kwh: 30 },
  { id: 'bi', nome: 'Bifásica', kwh: 50 },
  { id: 'tri', nome: 'Trifásica', kwh: 100 },
] as const;

/* Lei 14.300/2022: parcela do Fio B paga sobre a energia compensada (GD II).
   2029 em diante: a regra será definida pela ANEEL; o simulador assume 100% (conservador). */
export const FIO_B_ANO: Record<number, number> = { 2026: 0.6, 2027: 0.75, 2028: 0.9 };
export const fioBPct = (ano: number) => (ano < 2026 ? 0.6 : FIO_B_ANO[ano] ?? 1);

/* Perfil de uso: parte da geração consumida no mesmo instante (não paga Fio B).
   Premissa do simulador; o estudo da SW usa a curva de carga real do cliente. */
export const PERFIS = [
  { id: 'res', nome: 'Residência', simult: 0.3 },
  { id: 'emp', nome: 'Empresa, comércio ou agro', simult: 0.5 },
] as const;

/* Geração mensal média por kWp instalado (kWh/kWp), jan a dez.
   Fonte: PVGIS 5.3 (Comissão Europeia, JRC), base PVGIS-ERA5, inclinação ótima,
   perdas do sistema de 14%. Consulta feita em 08/10/2026. */
export const CIDADES = [
  { cidade: 'Ponta Grossa', uf: 'PR', lat: -25.095, lon: -50.162, mensal: [117.9, 112.2, 121.5, 112.2, 103.5, 95.8, 109.8, 122.9, 119.5, 115.0, 118.6, 122.4] },
  { cidade: 'Palmeira', uf: 'PR', lat: -25.429, lon: -50.006, mensal: [118.3, 112.2, 121.0, 111.0, 102.6, 95.9, 109.6, 122.3, 118.9, 114.3, 118.6, 122.5] },
  { cidade: 'Guarapuava', uf: 'PR', lat: -25.39, lon: -51.463, mensal: [119.6, 110.9, 120.9, 111.2, 100.2, 92.2, 106.7, 120.0, 121.2, 117.5, 122.8, 125.8] },
  { cidade: 'Imbituva', uf: 'PR', lat: -25.23, lon: -50.604, mensal: [117.8, 112.1, 123.0, 115.2, 105.7, 97.4, 112.5, 126.6, 123.7, 117.7, 120.3, 122.7] },
  { cidade: 'Curitiba', uf: 'PR', lat: -25.428, lon: -49.273, mensal: [112.5, 106.4, 114.3, 104.8, 97.8, 90.8, 102.1, 111.8, 106.5, 103.0, 109.0, 114.8] },
  { cidade: 'Irati', uf: 'PR', lat: -25.467, lon: -50.651, mensal: [117.0, 110.7, 120.2, 111.4, 102.8, 95.9, 110.8, 123.6, 120.6, 114.4, 118.4, 121.4] },
  { cidade: 'Prudentópolis', uf: 'PR', lat: -25.213, lon: -50.978, mensal: [119.6, 111.9, 120.4, 110.3, 99.8, 91.5, 106.3, 119.9, 120.4, 117.8, 122.4, 126.1] },
  { cidade: 'Castro', uf: 'PR', lat: -24.791, lon: -50.012, mensal: [117.9, 112.8, 123.2, 114.4, 105.2, 97.3, 110.9, 124.5, 121.5, 117.2, 119.7, 123.0] },
  { cidade: 'Telêmaco Borba', uf: 'PR', lat: -24.324, lon: -50.616, mensal: [118.4, 113.6, 128.2, 122.2, 112.3, 102.5, 117.0, 131.4, 129.5, 125.6, 124.7, 124.9] },
  { cidade: 'Londrina', uf: 'PR', lat: -23.31, lon: -51.162, mensal: [121.5, 116.0, 128.2, 119.9, 107.6, 95.4, 109.0, 125.3, 129.1, 131.7, 131.8, 132.1] },
  { cidade: 'Maringá', uf: 'PR', lat: -23.42, lon: -51.933, mensal: [125.3, 118.4, 130.8, 122.1, 108.6, 96.5, 109.5, 126.1, 129.3, 133.0, 134.0, 134.9] },
  { cidade: 'Cascavel', uf: 'PR', lat: -24.955, lon: -53.455, mensal: [141.6, 121.9, 125.1, 102.9, 82.8, 70.3, 82.2, 103.2, 117.0, 128.5, 141.2, 147.9] },
  { cidade: 'Francisco Beltrão', uf: 'PR', lat: -26.081, lon: -53.055, mensal: [144.4, 124.5, 123.0, 99.8, 79.4, 67.0, 79.0, 99.6, 113.3, 126.7, 143.5, 150.5] },
  { cidade: 'Paranavaí', uf: 'PR', lat: -23.073, lon: -52.465, mensal: [128.0, 120.2, 131.8, 121.9, 107.2, 95.3, 108.4, 125.5, 129.6, 134.7, 135.9, 137.3] },
  { cidade: 'Florianópolis', uf: 'SC', lat: -27.595, lon: -48.548, mensal: [123.7, 114.6, 121.0, 111.6, 98.6, 87.7, 96.8, 107.3, 106.3, 107.3, 117.1, 124.9] },
  { cidade: 'Joinville', uf: 'SC', lat: -26.304, lon: -48.846, mensal: [111.7, 103.9, 109.0, 101.2, 92.3, 81.5, 88.2, 95.3, 93.0, 92.5, 102.5, 109.5] },
  { cidade: 'Blumenau', uf: 'SC', lat: -26.919, lon: -49.066, mensal: [115.5, 107.4, 112.8, 104.0, 93.5, 82.7, 91.0, 98.9, 96.2, 94.3, 105.1, 112.1] },
  { cidade: 'Chapecó', uf: 'SC', lat: -27.1, lon: -52.615, mensal: [147.1, 126.2, 120.9, 97.6, 75.1, 63.3, 75.6, 95.2, 108.5, 125.0, 143.6, 153.0] },
  { cidade: 'Lages', uf: 'SC', lat: -27.816, lon: -50.326, mensal: [126.9, 118.6, 121.5, 112.3, 96.9, 87.2, 102.1, 115.9, 115.1, 116.6, 126.5, 130.3] },
  { cidade: 'Canoinhas', uf: 'SC', lat: -26.177, lon: -50.39, mensal: [117.9, 110.2, 115.5, 103.9, 93.9, 86.4, 101.2, 114.0, 112.8, 107.4, 115.5, 120.2] },
  { cidade: 'Criciúma', uf: 'SC', lat: -28.678, lon: -49.37, mensal: [142.9, 122.6, 115.2, 92.7, 73.7, 61.7, 70.9, 88.8, 100.6, 118.4, 138.6, 151.3] },
];

/* Preço de referência de mercado (sistema instalado, R$/Wp).
   Fonte: Greener, estudo Soluções Energéticas Distribuídas, 1º semestre de 2026:
   2 kWp = R$ 3,62/Wp (jun/26); 30 e 50 kWp = R$ 2,02/Wp (jun/26);
   4 kWp = R$ 2,66/Wp no início de 2026, +7% no semestre = R$ 2,85/Wp.
   O preço da SW sai na proposta, a partir do projeto. */
export const PRECO_WP: [number, number][] = [
  [2, 3.62],
  [4, 2.85],
  [30, 2.02],
  [50, 2.02],
];

export const MODULO_W = 610;      // módulo de referência
export const AREA_MODULO = 2.7;   // m² de telhado por módulo, aproximado
export const DEGRADACAO = 0.005;  // perda de rendimento por ano
export const ANOS = 25;
