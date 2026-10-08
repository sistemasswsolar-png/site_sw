import {
  DISTRIBUIDORAS, TRIBUTOS, LIGACOES, PERFIS, CIDADES, PRECO_WP,
  MODULO_W, AREA_MODULO, DEGRADACAO, ANOS, fioBPct,
} from '../data/simulador';

export type Entrada = {
  cidade: number;            // índice em CIDADES
  ligacao: (typeof LIGACOES)[number]['id'];
  perfil: (typeof PERFIS)[number]['id'];
  modo: 'reais' | 'kwh';
  valor: number;             // R$ por mês ou kWh por mês
  anoInicio: number;         // ano em que o sistema começa a gerar
};

export type Resultado = {
  uf: 'PR' | 'SC';
  distribuidora: string;
  tarifaFinal: number;       // R$/kWh com tributos
  consumo: number;           // kWh/mês
  kwp: number;
  modulos: number;
  area: number;
  geracaoMensal: number[];   // kWh, 1º ano
  geracaoMedia: number;
  contaHoje: number;         // R$/mês
  contaSolar: number;        // R$/mês, média do 1º ano
  economiaMes: number;
  economiaPct: number;
  investimento: number;
  payback: number | null;    // anos
  economia25: number;
  fluxo: number[];           // saldo acumulado ao fim de cada ano (ano 0 = -investimento)
  grande: boolean;           // acima de 75 kWp (minigeração)
};

const imposto = (uf: 'PR' | 'SC', kwh: number) => TRIBUTOS.icms[uf](kwh) + TRIBUTOS.pisCofins;

export function precoWp(kwp: number) {
  const p = PRECO_WP;
  if (kwp <= p[0][0]) return p[0][1];
  for (let i = 1; i < p.length; i++) {
    const [k0, v0] = p[i - 1], [k1, v1] = p[i];
    if (kwp <= k1) {
      const t = Math.log(kwp / k0) / Math.log(k1 / k0);
      return v0 + (v1 - v0) * t;
    }
  }
  return p[p.length - 1][1];
}

export function simular(e: Entrada): Resultado {
  const c = CIDADES[e.cidade];
  const uf = c.uf as 'PR' | 'SC';
  const d = DISTRIBUIDORAS[uf];
  const tarifa = d.tusd + d.te;
  const disp = LIGACOES.find((l) => l.id === e.ligacao)!.kwh;
  const simult = PERFIS.find((p) => p.id === e.perfil)!.simult;

  // Consumo a partir da conta: tributos "por dentro" (ICMS + PIS/COFINS).
  // Em SC a alíquota depende do consumo, então resolve para a faixa certa.
  let consumo: number;
  if (e.modo === 'kwh') consumo = e.valor;
  else {
    consumo = e.valor * (1 - imposto(uf, 9999)) / tarifa;
    if (uf === 'SC') {
      const baixo = e.valor * (1 - imposto(uf, 0)) / tarifa;
      if (baixo <= 150) consumo = baixo;
    }
  }
  consumo = Math.max(consumo, 0);
  const tx = imposto(uf, consumo);
  const tarifaFinal = tarifa / (1 - tx);
  const fioBFinal = d.fioB / (1 - tx);

  // Dimensionamento: gerar o consumo acima do mínimo faturado.
  const anual = c.mensal.reduce((s, v) => s + v, 0);
  const alvo = Math.max(consumo - disp, 0);
  const modulos = alvo > 0 ? Math.max(1, Math.ceil((alvo * 12 / anual) * 1000 / MODULO_W)) : 0;
  const kwp = modulos * MODULO_W / 1000;

  const investimento = kwp * 1000 * precoWp(kwp);
  const contaHoje = Math.max(consumo, disp) * tarifaFinal;

  // Fluxo mês a mês, com créditos acumulados e Fio B da Lei 14.300.
  const fluxo = [-investimento];
  let credito = 0, saldo = -investimento, payback: number | null = null, economia25 = 0;
  let geracao1: number[] = [], contaSolar1 = 0;
  for (let a = 0; a < ANOS; a++) {
    const ano = e.anoInicio + a;
    const fator = Math.pow(1 - DEGRADACAO, a);
    const pct = fioBPct(ano);
    let econAno = 0;
    for (let m = 0; m < 12; m++) {
      const g = kwp * c.mensal[m] * fator;
      const auto = Math.min(g * simult, consumo);
      const injetada = g - auto;
      const rede = consumo - auto;
      const comp = Math.min(injetada + credito, Math.max(rede - disp, 0));
      credito = credito + injetada - comp;
      const conta = Math.max(rede - comp, disp) * tarifaFinal + comp * fioBFinal * pct;
      econAno += contaHoje - conta;
      if (a === 0) { geracao1.push(g); contaSolar1 += conta; }
    }
    const antes = saldo;
    saldo += econAno;
    economia25 += econAno;
    fluxo.push(saldo);
    if (payback === null && saldo >= 0 && econAno > 0) payback = a + (-antes / econAno);
  }

  const contaSolar = contaSolar1 / 12;
  return {
    uf,
    distribuidora: d.nome,
    tarifaFinal,
    consumo,
    kwp,
    modulos,
    area: modulos * AREA_MODULO,
    geracaoMensal: geracao1,
    geracaoMedia: geracao1.reduce((s, v) => s + v, 0) / 12,
    contaHoje,
    contaSolar,
    economiaMes: contaHoje - contaSolar,
    economiaPct: contaHoje > 0 ? (contaHoje - contaSolar) / contaHoje : 0,
    investimento,
    payback,
    economia25,
    fluxo,
    grande: kwp > 75,
  };
}
