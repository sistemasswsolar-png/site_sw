/* =====================================================================
   SW SOLAR | MOTOR DE ROLAGEM
   Um único laço (requestAnimationFrame, disparado pela rolagem) escreve
   uma variável --p (0 a 1) em cada elemento com data-prog. O CSS faz o
   resto: escala das folhas, palco fixo, cartões empilhados, parallax.
   Só elementos perto da tela entram na conta (IntersectionObserver).

   Modos de data-prog:
     pass   (padrão) 0 quando o topo entra por baixo, 1 quando a base sai por cima
     enter  0 quando o topo entra por baixo, 1 quando o topo chega no topo da tela
     exit   0 com o topo no topo da tela, 1 quando a base sai por cima (hero)
     pin    trilho com palco sticky: 0 no início do trilho, 1 no fim
     center 0 quando o topo cruza o meio da tela, 1 quando a base cruza
     janela 0 com o topo a 85% da altura da tela, 1 com o topo a 30%
   data-atos="N" também escreve data-ato (1..N) a partir do --p.
   ===================================================================== */
const root = document.documentElement;
const motion = root.classList.contains('motion');

type Item = { el: HTMLElement; mode: string; atos: number; last: number; vivo: boolean };
const itens: Item[] = [...document.querySelectorAll<HTMLElement>('[data-prog]')].map((el) => ({
  el, mode: el.dataset.prog || 'pass', atos: Number(el.dataset.atos || 0), last: -1, vivo: false,
}));

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function medir(it: Item, h: number) {
  const r = it.el.getBoundingClientRect();
  let p: number;
  switch (it.mode) {
    case 'enter': p = (h - r.top) / h; break;
    case 'exit': p = -r.top / Math.max(1, r.height); break;
    case 'pin': p = -r.top / Math.max(1, r.height - h); break;
    case 'center': p = (h * 0.5 - r.top) / Math.max(1, r.height); break;
    case 'janela': p = (h * 0.85 - r.top) / (h * 0.55); break;
    default: p = (h - r.top) / (h + r.height);
  }
  p = Math.round(clamp(p) * 1000) / 1000;
  if (p === it.last) return;
  it.last = p;
  it.el.style.setProperty('--p', String(p));
  if (it.atos) {
    const a = String(Math.min(it.atos, Math.floor(p * it.atos) + 1));
    if (it.el.dataset.ato !== a) it.el.dataset.ato = a;
  }
}

/* cartões empilhados: cada cartão escurece e encolhe conforme o próximo o cobre */
const pilhas = [...document.querySelectorAll<HTMLElement>('[data-pilha]')].map((p) => [...p.querySelectorAll<HTMLElement>(':scope > .pcard')]);
function empilhar() {
  for (const cartas of pilhas) {
    for (let i = 0; i < cartas.length - 1; i++) {
      const a = cartas[i].getBoundingClientRect(), b = cartas[i + 1].getBoundingClientRect();
      if (a.bottom < -200 || a.top > innerHeight + 200) continue;
      const q = Math.round(clamp((a.bottom - b.top) / Math.max(1, a.height)) * 1000) / 1000;
      cartas[i].style.setProperty('--q', String(q));
    }
  }
}

/* cabeçalho de vidro: claro sobre seções claras */
const hdr = document.getElementById('hdr');
const claras = [...document.querySelectorAll<HTMLElement>('[data-theme="light"]')];
function tema() {
  if (!hdr) return;
  const y = 44;
  const sobreClaro = claras.some((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
  hdr.classList.toggle('claro', sobreClaro);
}

let agendado = false;
function quadro() {
  agendado = false;
  const h = innerHeight;
  for (const it of itens) if (it.vivo) medir(it, h);
  if (motion) empilhar();
  tema();
}
const pedir = () => { if (!agendado) { agendado = true; requestAnimationFrame(quadro); } };

if (motion) {
  const io = new IntersectionObserver((es) => {
    for (const e of es) { const it = itens.find((i) => i.el === e.target); if (it) it.vivo = e.isIntersecting; }
    pedir();
  }, { rootMargin: '25% 0px 25% 0px' });
  itens.forEach((it) => io.observe(it.el));
} else {
  // sem animação: tudo no estado final
  itens.forEach((it) => { it.el.style.setProperty('--p', '1'); if (it.atos) it.el.dataset.ato = String(it.atos); });
}
addEventListener('scroll', pedir, { passive: true });
addEventListener('resize', pedir, { passive: true });
addEventListener('load', pedir);
pedir();

/* ---------- inclinação 3D com o ponteiro (só mouse, nunca com menos movimento) ---------- */
if (motion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const forca = Number(el.dataset.tilt || 8);
    let ret: DOMRect | null = null, ax = 0, ay = 0, x = 0, y = 0, raf = 0;
    const laco = () => {
      x += (ax - x) * 0.12; y += (ay - y) * 0.12;
      el.style.transform = `perspective(1000px) rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
      if (Math.abs(ax - x) > 0.02 || Math.abs(ay - y) > 0.02) raf = requestAnimationFrame(laco);
      else { raf = 0; if (!ax && !ay) el.style.transform = ''; }
    };
    const acorda = () => { if (!raf) raf = requestAnimationFrame(laco); };
    el.addEventListener('pointerenter', () => { ret = el.getBoundingClientRect(); el.classList.add('na-mao'); });
    el.addEventListener('pointermove', (e) => {
      if (!ret) ret = el.getBoundingClientRect();
      const nx = (e.clientX - ret.left) / ret.width - 0.5, ny = (e.clientY - ret.top) / ret.height - 0.5;
      ax = nx * forca; ay = -ny * forca * 0.8;
      el.style.setProperty('--mx', `${((nx + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${((ny + 0.5) * 100).toFixed(1)}%`);
      acorda();
    }, { passive: true });
    el.addEventListener('pointerleave', () => { ax = 0; ay = 0; ret = null; el.classList.remove('na-mao'); acorda(); });
    addEventListener('scroll', () => { ret = null; }, { passive: true });
  });
}
