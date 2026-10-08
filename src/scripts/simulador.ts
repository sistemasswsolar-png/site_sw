import { simular, type Entrada } from '../lib/simular';
import { CIDADES, LIGACOES, PERFIS } from '../data/simulador';
import { UNIDADES, waLink } from '../data/site';

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector(s) as T;
const form = $<HTMLFormElement>('#simForm');
if (form) {
  const valor = $<HTMLInputElement>('#sValor');
  const range = $<HTMLInputElement>('#sRange');
  const motion = document.documentElement.classList.contains('motion');
  const fmt = (n: number, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

  // Controle deslizante em escala logarítmica: valores baixos com precisão, altos com alcance.
  const MIN = 150, MAX = 20000;
  const deRange = (t: number) => Math.round((MIN * Math.pow(MAX / MIN, t / 1000)) / 10) * 10;
  const paraRange = (v: number) => Math.round((1000 * Math.log(Math.min(Math.max(v, MIN), MAX) / MIN)) / Math.log(MAX / MIN));

  const agora = new Date();
  const anoInicio = agora.getMonth() >= 9 ? agora.getFullYear() + 1 : agora.getFullYear();

  // Números que deslizam do valor anterior ao novo.
  const atual = new Map<string, number>();
  function anima(id: string, alvo: number, dec = 0, texto?: string) {
    const el = document.getElementById(id);
    if (!el) return;
    if (texto) { el.textContent = texto; atual.set(id, alvo); return; }
    const de = atual.get(id) ?? 0;
    atual.set(id, alvo);
    if (!motion || de === alvo) { el.textContent = fmt(alvo, dec); return; }
    const t0 = performance.now(), dur = 600;
    const passo = (t: number) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      if (atual.get(id) !== alvo) return;
      el.textContent = fmt(de + (alvo - de) * e, dec);
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  const dist = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
    const r = Math.PI / 180, x = (b.lon - a.lon) * r * Math.cos(((a.lat + b.lat) / 2) * r), y = (b.lat - a.lat) * r;
    return Math.hypot(x, y);
  };

  const ler = (): Entrada => {
    const fd = new FormData(form);
    return {
      cidade: Number(fd.get('cidade')),
      perfil: fd.get('perfil') as Entrada['perfil'],
      ligacao: fd.get('ligacao') as Entrada['ligacao'],
      modo: fd.get('modo') as Entrada['modo'],
      valor: Math.max(0, Number(valor.value) || 0),
      anoInicio,
    };
  };

  const bars = [...document.querySelectorAll<SVGRectElement>('#cGer .bar')];
  const ns = 'http://www.w3.org/2000/svg';
  function grade(g: Element, ys: { y: number; t: string }[], x1: number, x2: number) {
    g.textContent = '';
    for (const { y, t } of ys) {
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('class', 'gl'); l.setAttribute('x1', String(x1)); l.setAttribute('x2', String(x2));
      l.setAttribute('y1', String(y)); l.setAttribute('y2', String(y)); g.appendChild(l);
      const tx = document.createElementNS(ns, 'text');
      tx.setAttribute('class', 'ax'); tx.setAttribute('x', String(x1 - 4)); tx.setAttribute('y', String(y + 4));
      tx.setAttribute('text-anchor', 'end'); tx.textContent = t; g.appendChild(tx);
    }
  }
  const passoBonito = (max: number, n = 4) => {
    const bruto = max / n, p = Math.pow(10, Math.floor(Math.log10(bruto || 1))), f = bruto / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  };
  const curto = (v: number) => Math.abs(v) >= 1e6 ? fmt(v / 1e6, 1) + ' mi' : Math.abs(v) >= 1e3 ? fmt(v / 1e3, 0) + ' mil' : fmt(v, 0);

  let visto = false;
  function desenhar(animarLinha: boolean) {
    const e = ler();
    const r = simular(e);
    const c = CIDADES[e.cidade];

    anima('rEcon', Math.max(0, r.economiaMes));
    anima('rPct', Math.max(0, r.economiaPct * 100));
    if (r.payback === null) anima('rPay', 25, 0, '25+'); else anima('rPay', r.payback, 1);
    anima('rKwp', r.kwp, 2);
    anima('rMod', r.modulos);
    anima('rArea', r.area);
    anima('rGer', r.geracaoMedia);
    anima('rInv', Math.round(r.investimento / 100) * 100);
    anima('rHoje', r.contaHoje);
    anima('rSolar', r.contaSolar);
    const maxConta = Math.max(r.contaHoje, 1);
    $('#bHoje').style.setProperty('--v', '1');
    $('#bSolar').style.setProperty('--v', String(Math.max(0.02, r.contaSolar / maxConta)));

    // Gráfico 1: geração mensal x consumo.
    const topo = Math.max(...r.geracaoMensal, r.consumo) * 1.1 || 1;
    const passo = passoBonito(topo);
    const escalaMax = Math.ceil(topo / passo) * passo;
    const yOf = (v: number) => 160 - (v / escalaMax) * 145;
    const linhas = [];
    for (let v = 0; v <= escalaMax + 1e-9; v += passo) linhas.push({ y: yOf(v), t: curto(v) });
    grade($('#gGrid'), linhas, 36, 352);
    bars.forEach((b, i) => { b.style.transform = visto || !motion ? `scaleY(${(r.geracaoMensal[i] || 0) / escalaMax})` : 'scaleY(0)'; b.dataset.v = String((r.geracaoMensal[i] || 0) / escalaMax); });
    const cons = $('#gCons');
    cons.setAttribute('y1', String(yOf(r.consumo))); cons.setAttribute('y2', String(yOf(r.consumo)));

    // Gráfico 2: saldo acumulado em 25 anos.
    const f = r.fluxo;
    const mn = Math.min(...f, 0), mx = Math.max(...f, 0);
    const p2 = passoBonito(mx - mn || 1);
    const lo = Math.floor(mn / p2) * p2, hi = Math.ceil(mx / p2) * p2 || p2;
    const fy = (v: number) => 170 - ((v - lo) / (hi - lo)) * 158;
    const fx = (a: number) => 40 + a * 12.48;
    const gl = [];
    for (let v = lo; v <= hi + 1e-9; v += p2) gl.push({ y: fy(v), t: curto(v) });
    grade($('#fGrid'), gl, 40, 352);
    const d = f.map((v, a) => `${a ? 'L' : 'M'}${fx(a).toFixed(1)} ${fy(v).toFixed(1)}`).join(' ');
    $('#fLin').setAttribute('d', d);
    $('#fArea').setAttribute('d', `${d} L${fx(f.length - 1)} ${fy(0)} L${fx(0)} ${fy(0)} Z`);
    const z = $('#fZero'); z.setAttribute('y1', String(fy(0))); z.setAttribute('y2', String(fy(0)));
    const pb = $('#fPb');
    if (r.payback !== null) {
      pb.style.display = '';
      const px = fx(r.payback), py = fy(0);
      pb.querySelector('circle')!.setAttribute('cx', String(px)); pb.querySelector('circle')!.setAttribute('cy', String(py));
      const t = pb.querySelector('text')!; t.setAttribute('x', String(Math.min(px + 10, 250))); t.setAttribute('y', String(py + 18)); t.setAttribute('text-anchor', 'start');
      t.textContent = `se paga em ${fmt(r.payback, 1)} anos`;
    } else pb.style.display = 'none';
    if (animarLinha && motion) { const ch = $('#cFlu'); ch.classList.remove('draw'); void ch.getBoundingClientRect(); ch.classList.add('draw'); }

    ($('#rGrande') as HTMLElement).hidden = !r.grande;

    // Lead no WhatsApp da unidade mais próxima, já com a simulação.
    const uni = UNIDADES.reduce((a, u) => (dist(u, c) < dist(a, c) ? u : a), UNIDADES[0]);
    $('#rUni').textContent = uni.cidade;
    const lig = LIGACOES.find((l) => l.id === e.ligacao)!.nome.toLowerCase();
    const per = PERFIS.find((p) => p.id === e.perfil)!.nome.toLowerCase();
    const conta = e.modo === 'reais' ? `conta média de R$ ${fmt(e.valor)}` : `consumo médio de ${fmt(e.valor)} kWh`;
    const msg = `Olá! Fiz a simulação no site da SW Solar: ${per} em ${c.cidade}/${c.uf}, ligação ${lig}, ${conta}. ` +
      `Resultado: sistema de ${fmt(r.kwp, 2)} kWp, economia estimada de R$ ${fmt(r.economiaMes)} por mês. Quero receber uma proposta.`;
    ($('#rWa') as HTMLAnchorElement).href = waLink(msg, uni.whats);
  }

  // Sincroniza campo numérico e controle deslizante.
  range.addEventListener('input', () => { valor.value = String(deRange(Number(range.value))); desenhar(false); });
  range.addEventListener('change', () => desenhar(true));
  valor.addEventListener('input', () => { range.value = String(paraRange(Number(valor.value))); desenhar(false); });
  valor.addEventListener('change', () => desenhar(true));
  form.addEventListener('change', (ev) => {
    const t = ev.target as HTMLInputElement;
    if (t.name === 'modo') {
      $('#sUn').textContent = t.value === 'reais' ? 'R$/mês' : 'kWh/mês';
      $('#sDica').textContent = t.value === 'reais' ? 'Use a média dos últimos 12 meses.' : 'Está no histórico de consumo da conta.';
      valor.setAttribute('aria-label', t.value === 'reais' ? 'Valor médio da conta' : 'Consumo médio mensal');
    }
    if (t !== valor) desenhar(true);
  });
  form.addEventListener('submit', (ev) => ev.preventDefault());
  range.value = String(paraRange(Number(valor.value)));
  desenhar(false);

  // Primeira vez que os gráficos aparecem: barras sobem e a linha se desenha.
  const io = new IntersectionObserver((es) => {
    if (!es.some((x) => x.isIntersecting)) return;
    visto = true; io.disconnect();
    bars.forEach((b) => (b.style.transform = `scaleY(${b.dataset.v})`));
    desenhar(true);
  }, { threshold: 0.3 });
  io.observe($('#cGer'));
}
